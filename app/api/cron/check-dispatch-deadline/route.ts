import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authorizeCron } from "@/lib/cron/guard";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Marca como vencidos los despachos pendientes que pasaron su deadline. */
export async function GET(req: Request) {
  const deny = authorizeCron(req);
  if (deny) return deny;

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, demo: true, vencidos: 0 });
  }

  try {
    const ahora = new Date().toISOString();
    const { data, error } = await supabase
      .from("dispatch_instructions")
      .select("id, folio, provider_id")
      .in("estado", ["pendiente", "impreso"])
      .lt("deadline", ahora)
      .limit(200);
    if (error) throw error;

    let vencidos = 0;
    for (const d of data ?? []) {
      await supabase.from("dispatch_instructions").update({ estado: "vencido" }).eq("id", d.id);
      await logAudit({ accion: "dispatch.vencido", entidad: "dispatch", entidad_id: d.folio, detalle: "Despacho no confirmado antes del deadline" });
      vencidos++;
    }
    return NextResponse.json({ ok: true, vencidos });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
