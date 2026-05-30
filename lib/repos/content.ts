import { createClient } from "@/lib/supabase/server";
import { SITE_CONTENT, NOTIFICATION_RULES, type SiteContent, type NotificationRule } from "@/lib/data/admin";

export async function fetchSiteContent(): Promise<SiteContent> {
  const supabase = createClient();
  if (!supabase) return SITE_CONTENT;
  try {
    const { data } = await supabase.from("platform_config").select("valor").eq("clave", "site_content").single();
    if (data?.valor) return { ...SITE_CONTENT, ...(data.valor as SiteContent) };
    return SITE_CONTENT;
  } catch {
    return SITE_CONTENT;
  }
}

export async function fetchNotificationRules(): Promise<NotificationRule[]> {
  const supabase = createClient();
  if (!supabase) return NOTIFICATION_RULES;
  try {
    const { data, error } = await supabase.from("notification_rules").select("*").order("id");
    if (error || !data || data.length === 0) return NOTIFICATION_RULES;
    return data.map((r: any) => ({ id: r.id, evento: r.evento, descripcion: r.descripcion ?? "", canales: r.canales ?? [], plantilla: r.plantilla ?? "", activo: r.activo ?? true }));
  } catch {
    return NOTIFICATION_RULES;
  }
}
