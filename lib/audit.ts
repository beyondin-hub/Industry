import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/repos/admin-context";

/**
 * Registra una acción en la bitácora de auditoría. Si no hay Supabase,
 * deja un log en servidor (modo demo). Nunca lanza.
 */
export async function logAudit(entry: {
  accion: string;
  entidad: string;
  entidad_id: string;
  detalle?: Record<string, unknown> | string;
}): Promise<void> {
  try {
    const ctx = await getAdminContext();
    const supabase = createClient();
    if (!supabase || ctx.isDemo) {
      console.info(`[audit demo] ${ctx.nombre} · ${entry.accion} · ${entry.entidad}:${entry.entidad_id}`);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_log").insert({
      actor_id: user?.id ?? null,
      actor_nombre: ctx.nombre,
      accion: entry.accion,
      entidad: entry.entidad,
      entidad_id: entry.entidad_id,
      detalle: typeof entry.detalle === "string" ? { msg: entry.detalle } : entry.detalle ?? {},
    });
  } catch {
    /* auditoría nunca rompe el flujo */
  }
}
