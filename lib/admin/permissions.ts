// ────────────────────────────────────────────────────────────
// Roles y permisos del EQUIPO NOVAK (operadores internos).
// Distinto del rol de plataforma (comprador/proveedor/admin).
// El "admin" de plataforma entra al panel; aquí se subdivide qué
// secciones puede operar según su rol interno.
// ────────────────────────────────────────────────────────────

export type AdminRole = "super_admin" | "ops" | "finanzas" | "soporte";

export const ADMIN_ROLES: { id: AdminRole; label: string; desc: string }[] = [
  { id: "super_admin", label: "Super Admin", desc: "Control total: equipo, finanzas, operación y configuración." },
  { id: "ops", label: "Operaciones", desc: "Mesa de RFQs, cotizaciones, proveedores y compradores." },
  { id: "finanzas", label: "Finanzas", desc: "Tesorería, crédito y facturación." },
  { id: "soporte", label: "Soporte", desc: "Mensajería, consulta de órdenes y cuentas." },
];

// Secciones del panel (clave = identificador de permiso).
export const ADMIN_SECTIONS = [
  "dashboard", "rfq", "cotizador", "ordenes", "catalogo", "proveedores",
  "compradores", "credito", "tesoreria", "equipo", "auditoria",
] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

const PERMISOS: Record<AdminRole, AdminSection[]> = {
  super_admin: [...ADMIN_SECTIONS],
  ops: ["dashboard", "rfq", "cotizador", "ordenes", "catalogo", "proveedores", "compradores"],
  finanzas: ["dashboard", "ordenes", "compradores", "credito", "tesoreria", "auditoria"],
  soporte: ["dashboard", "rfq", "ordenes", "proveedores"],
};

export function can(role: AdminRole, section: AdminSection): boolean {
  return PERMISOS[role]?.includes(section) ?? false;
}

export function roleLabel(role: AdminRole): string {
  return ADMIN_ROLES.find((r) => r.id === role)?.label ?? role;
}
