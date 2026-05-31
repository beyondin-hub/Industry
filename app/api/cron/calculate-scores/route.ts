import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authorizeCron } from "@/lib/cron/guard";
import { fetchProviderScores } from "@/lib/scoring/metrics";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recalcula el score de todos los proveedores y aplica consecuencias:
 *  - score < 6 → reducir visibilidad
 *  - score < 5 → suspender
 * Mensual (Vercel cron) o manual.
 */
export async function GET(req: Request) {
  const deny = authorizeCron(req);
  if (deny) return deny;

  const rows = await fetchProviderScores();
  const supabase = createClient();
  const resumen = { evaluados: rows.length, suspendidos: 0, visibilidad_reducida: 0, observacion: 0 };

  for (const r of rows) {
    const c = r.breakdown.consecuencia;
    if (c === "suspender") resumen.suspendidos++;
    else if (c === "reducir_visibilidad") resumen.visibilidad_reducida++;
    else if (c === "flag") resumen.observacion++;

    if (supabase) {
      try {
        const patch: Record<string, unknown> = { score: r.breakdown.score };
        if (c === "suspender") patch.estado = "suspendido";
        await supabase.from("providers").update(patch).eq("id", r.provider_id);
      } catch { /* demo */ }
    }
  }

  await logAudit({
    accion: "scoring.run",
    entidad: "proveedores",
    entidad_id: "*",
    detalle: `Scoring: ${resumen.evaluados} evaluados · ${resumen.suspendidos} suspendidos · ${resumen.visibilidad_reducida} con visibilidad reducida`,
  });

  return NextResponse.json({ ok: true, ...resumen });
}
