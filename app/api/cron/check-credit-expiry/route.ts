import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authorizeCron } from "@/lib/cron/guard";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Recuerda créditos B2B por vencer (3 días) y marca vencidos. */
export async function GET(req: Request) {
  const deny = authorizeCron(req);
  if (deny) return deny;

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, demo: true, por_vencer: 0, vencidos: 0 });
  }

  try {
    const ahora = new Date();
    const en3dias = new Date(ahora.getTime() + 3 * 24 * 36e5).toISOString();
    const { data, error } = await supabase
      .from("orders")
      .select("id, folio, company_id, fecha_vencimiento_credito, credito_estado")
      .eq("es_credito", true)
      .not("fecha_vencimiento_credito", "is", null)
      .neq("credito_estado", "pagado")
      .lt("fecha_vencimiento_credito", en3dias)
      .limit(300);
    if (error) throw error;

    let porVencer = 0;
    let vencidos = 0;
    for (const o of data ?? []) {
      const vencido = new Date(o.fecha_vencimiento_credito) < ahora;
      if (vencido) {
        await supabase.from("orders").update({ credito_estado: "vencido" }).eq("id", o.id);
        vencidos++;
      } else {
        porVencer++;
      }
    }
    await logAudit({ accion: "credito.recordatorio", entidad: "orders", entidad_id: "*", detalle: `${porVencer} por vencer · ${vencidos} vencidos` });
    return NextResponse.json({ ok: true, por_vencer: porVencer, vencidos });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
