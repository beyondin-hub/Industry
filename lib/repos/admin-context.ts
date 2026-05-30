import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/admin/permissions";

export interface AdminContext {
  nombre: string;
  email: string;
  adminRole: AdminRole;
  isDemo: boolean;
}

/**
 * Contexto del operador Novak (equipo interno). En demo es super_admin
 * para poder explorar todo. En vivo lee el rol interno de los metadatos
 * (`app_metadata.admin_role`) o de `team_members`.
 */
export async function getAdminContext(): Promise<AdminContext> {
  const demo: AdminContext = { nombre: "Equipo Novak", email: "ops@heynovak.com", adminRole: "super_admin", isDemo: true };
  const supabase = createClient();
  if (!supabase) return demo;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return demo;
    const fromMeta = (user.app_metadata as any)?.admin_role as AdminRole | undefined;
    let adminRole: AdminRole = fromMeta ?? "ops";
    let nombre = (user.user_metadata as any)?.nombre ?? user.email ?? "Operador";
    try {
      const { data: tm } = await supabase.from("team_members").select("nombre, rol_admin").eq("id", user.id).single();
      if (tm) { adminRole = (tm.rol_admin as AdminRole) ?? adminRole; nombre = tm.nombre ?? nombre; }
    } catch { /* tabla puede no existir aún */ }
    return { nombre, email: user.email ?? demo.email, adminRole, isDemo: false };
  } catch {
    return demo;
  }
}
