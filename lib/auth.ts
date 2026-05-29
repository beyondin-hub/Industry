// ────────────────────────────────────────────────────────────
// Roles de Novak y enrutamiento por rol.
//  - comprador : maquiladora (portal /dashboard…)
//  - proveedor : merchant del marketplace (portal /proveedor…)
//  - admin     : equipo Novak / mesa de operaciones (/admin…)
// El rol vive en los metadatos del usuario de Supabase (app_metadata.role
// o user_metadata.role) para que el middleware lo lea sin consultar la BD.
// La frontera de seguridad real son las RLS de Supabase.
// ────────────────────────────────────────────────────────────

export type Role = "comprador" | "proveedor" | "admin";

/** Página de inicio según el rol. */
export function homeForRole(role?: string | null): string {
  if (role === "proveedor") return "/proveedor/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}

const BUYER_PREFIXES = [
  "/dashboard",
  "/cotizar",
  "/cotizaciones",
  "/ordenes",
  "/credito",
  "/listas",
  "/reordenes",
  "/analytics",
  "/perfil",
  "/notificaciones",
  "/quick-order",
];

/** Qué rol exige una ruta (o null si es pública). */
export function areaForPath(path: string): Role | null {
  if (path.startsWith("/proveedor")) return "proveedor";
  if (path.startsWith("/admin")) return "admin";
  if (BUYER_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) return "comprador";
  return null;
}

/** Lee el rol desde el objeto user de Supabase. */
export function roleFromUser(user: any): Role | null {
  const r = user?.app_metadata?.role ?? user?.user_metadata?.role;
  return r === "comprador" || r === "proveedor" || r === "admin" ? r : null;
}
