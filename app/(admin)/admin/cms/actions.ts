"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import type { SiteContent, NotificationRule } from "@/lib/data/admin";

export async function saveSiteContent(content: SiteContent): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (supabase) {
    try { await supabase.from("platform_config").upsert({ clave: "site_content", valor: content as any, updated_at: new Date().toISOString() }); }
    catch (e: any) { return { ok: false, error: e?.message ?? "No se pudo guardar." }; }
  }
  await logAudit({ accion: "cms.save", entidad: "content", entidad_id: "site_content", detalle: "Actualizó contenido del sitio" });
  return { ok: true };
}

export async function saveNotificationRules(rules: NotificationRule[]): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("notification_rules").upsert(rules.map((r) => ({ ...r, updated_at: new Date().toISOString() })) as any);
    } catch (e: any) { return { ok: false, error: e?.message ?? "No se pudo guardar." }; }
  }
  await logAudit({ accion: "automation.save", entidad: "notification_rules", entidad_id: "all", detalle: "Actualizó reglas de notificación" });
  return { ok: true };
}
