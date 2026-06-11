import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * El proveedor confirma el despacho de una orden (dropshipping): sube
 * evidencia fotográfica y marca recolección lista. Mide el SLA de despacho
 * (creado → confirmado) para el scoring del proveedor.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      dispatchId?: string;
      folio?: string;
      evidenciaUrl?: string;
      guia?: string;
      nota?: string;
    };
    if (!body.dispatchId) {
      return NextResponse.json({ error: "Falta el despacho." }, { status: 400 });
    }

    const ahora = new Date();
    const supabase = createClient();
    let slaHoras: number | null = null;

    if (supabase) {
      try {
        const { data: di } = await supabase
          .from("dispatch_instructions")
          .select("id, created_at, deadline")
          .eq("id", body.dispatchId)
          .maybeSingle();
        if (di?.created_at) {
          slaHoras = Math.round(((ahora.getTime() - new Date(di.created_at).getTime()) / 36e5) * 10) / 10;
        }
        await supabase
          .from("dispatch_instructions")
          .update({
            estado: "despachado",
            evidencia_url: body.evidenciaUrl ?? null,
            guia: body.guia ?? null,
            confirmado_at: ahora.toISOString(),
            sla_horas: slaHoras,
            nota: body.nota ?? null,
          })
          .eq("id", body.dispatchId);
      } catch {
        /* demo */
      }
    }

    await logAudit({
      accion: "dispatch.confirm",
      entidad: "dispatch",
      entidad_id: body.folio ?? body.dispatchId,
      detalle: `Despacho confirmado${slaHoras != null ? ` · SLA ${slaHoras}h` : ""}`,
    });

    return NextResponse.json({ ok: true, sla_horas: slaHoras, confirmado_at: ahora.toISOString() });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
