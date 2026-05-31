import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { timbrarCFDI } from "@/lib/cfdi/client";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

/** Timbra el CFDI 4.0 de una orden y lo persiste si hay DB. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      orderId?: string;
      folio?: string;
      receptor_rfc?: string;
      receptor_nombre?: string;
      conceptos?: { descripcion: string; cantidad: number; valor_unitario: number }[];
    };
    if (!body.folio || !body.conceptos?.length) {
      return NextResponse.json({ error: "Faltan datos de la factura." }, { status: 400 });
    }

    const result = await timbrarCFDI({
      folio: body.folio,
      receptor_rfc: body.receptor_rfc ?? "XAXX010101000",
      receptor_nombre: body.receptor_nombre ?? "Público en general",
      conceptos: body.conceptos,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "No se pudo timbrar." }, { status: 502 });
    }

    const supabase = createClient();
    if (supabase && body.orderId) {
      try {
        await supabase
          .from("orders")
          .update({ cfdi_uuid: result.uuid, cfdi_url: result.pdf_url, cfdi_xml_url: result.xml_url })
          .eq("id", body.orderId);
      } catch {
        /* demo */
      }
    }

    await logAudit({ accion: "cfdi.timbrado", entidad: "order", entidad_id: body.folio, detalle: `UUID ${result.uuid}` });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
