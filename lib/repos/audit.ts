import { createClient } from "@/lib/supabase/server";
import { AUDIT_LOG, type AuditEntry } from "@/lib/data/admin";

export async function fetchAuditLog(limit = 100): Promise<AuditEntry[]> {
  const supabase = createClient();
  if (!supabase) return AUDIT_LOG;
  try {
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data || data.length === 0) return AUDIT_LOG;
    return data.map((r: any) => ({
      id: r.id,
      actor_nombre: r.actor_nombre ?? "Sistema",
      accion: r.accion,
      entidad: r.entidad ?? "",
      entidad_id: r.entidad_id ?? "",
      detalle: typeof r.detalle === "object" ? (r.detalle.msg ?? JSON.stringify(r.detalle)) : String(r.detalle ?? ""),
      created_at: r.created_at,
    }));
  } catch {
    return AUDIT_LOG;
  }
}
