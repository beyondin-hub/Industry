import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getShippingProvider } from "@/lib/shipping";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

/** Genera la guía (+ Carta Porte) con el carrier elegido y la persiste en el envío. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      shipmentId?: string;
      folio?: string;
      rateId?: string;
      carrier?: string;
      servicio_code?: string;
      origen?: { ciudad?: string; estado?: string; cp?: string };
      destino?: { ciudad?: string; estado?: string; cp?: string };
      peso_kg?: number;
      conCartaPorte?: boolean;
    };

    if (!body.carrier || !body.servicio_code) {
      return NextResponse.json({ error: "Falta carrier o servicio." }, { status: 400 });
    }

    const provider = getShippingProvider();
    const label = await provider.generarGuia({
      rateId: body.rateId,
      carrier: body.carrier,
      servicio_code: body.servicio_code,
      origen: { ciudad: body.origen?.ciudad || "Tijuana", estado: body.origen?.estado, cp: body.origen?.cp },
      destino: { ciudad: body.destino?.ciudad || "", estado: body.destino?.estado, cp: body.destino?.cp },
      paquete: { peso_kg: Math.max(1, Number(body.peso_kg) || 5) },
      referencia: body.folio,
      conCartaPorte: body.conCartaPorte ?? true,
    });

    const supabase = createClient();
    if (supabase && body.shipmentId) {
      try {
        await supabase
          .from("shipments")
          .update({
            guia: label.guia,
            carrier: label.carrier,
            carta_porte_uuid: label.carta_porte_uuid ?? null,
            etiqueta_url: label.etiqueta_url,
            tracking_url: label.tracking_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.shipmentId);
      } catch {
        /* demo */
      }
    }

    await logAudit({
      accion: "shipment.guide",
      entidad: "shipment",
      entidad_id: body.folio ?? body.shipmentId ?? label.guia,
      detalle: `${label.carrier} · guía ${label.guia}`,
    });

    return NextResponse.json({ ok: true, demo: provider.esDemo, label });
  } catch {
    return NextResponse.json({ error: "No se pudo generar la guía." }, { status: 400 });
  }
}
