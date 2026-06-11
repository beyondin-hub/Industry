import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authorizeCron } from "@/lib/cron/guard";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Garantía Novak: RFQs cuyo deadline de 2h hábiles venció sin cotización.
 * Activa el beneficio (siguiente orden 0% comisión) y alerta a operaciones.
 */
export async function GET(req: Request) {
  const deny = authorizeCron(req);
  if (deny) return deny;

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, demo: true, vencidos: 0, mensaje: "Sin DB: nada que evaluar." });
  }

  try {
    const ahora = new Date().toISOString();
    const { data, error } = await supabase
      .from("rfqs")
      .select("id, folio, company_id, deadline_cotizacion, estado, garantia_activada")
      .lt("deadline_cotizacion", ahora)
      .in("estado", ["nuevo", "cotizando"])
      .is("garantia_activada", null)
      .limit(200);
    if (error) throw error;

    let activados = 0;
    for (const r of data ?? []) {
      await supabase.from("rfqs").update({ garantia_activada: ahora }).eq("id", r.id);
      await logAudit({ accion: "rfq.garantia", entidad: "rfq", entidad_id: r.folio, detalle: "Garantía 2h activada: siguiente orden 0% comisión" });
      activados++;
    }
    return NextResponse.json({ ok: true, vencidos: activados });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
