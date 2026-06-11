import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authorizeCron } from "@/lib/cron/guard";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Dispara las reórdenes automáticas cuya próxima fecha llegó. */
export async function GET(req: Request) {
  const deny = authorizeCron(req);
  if (deny) return deny;

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, demo: true, disparadas: 0 });
  }

  try {
    const hoy = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("reorders")
      .select("id, company_id, proxima_fecha, activo")
      .eq("activo", true)
      .lte("proxima_fecha", hoy)
      .limit(200);
    if (error) throw error;

    let disparadas = 0;
    for (const r of data ?? []) {
      await supabase.from("reorders").update({ ultima_ejecucion: new Date().toISOString() }).eq("id", r.id);
      await logAudit({ accion: "reorden.disparo", entidad: "reorder", entidad_id: r.id, detalle: "Reorden automática generada" });
      disparadas++;
    }
    return NextResponse.json({ ok: true, disparadas });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
