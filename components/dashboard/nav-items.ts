import {
  LayoutDashboard,
  PackageSearch,
  FileSpreadsheet,
  FileCheck2,
  Truck,
  BarChart3,
  Repeat,
  ListChecks,
  Building2,
  Store,
  ClipboardList,
  Bell,
  ScanBarcode,
  CreditCard,
  Package,
  MessagesSquare,
  Landmark,
  Users,
  Building,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { AdminSection } from "@/lib/admin/permissions";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}
export interface AdminNavItem extends NavItem {
  section: AdminSection;
}

// ─── COMPRADOR (maquiladora) — solo módulos de compra ───────────
export const COMPRADOR_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/catalogo", label: "Catálogo MRO", icon: PackageSearch },
  { href: "/quick-order", label: "Quick Order", icon: ScanBarcode },
  { href: "/cotizar", label: "Cotizar (RFQ)", icon: FileSpreadsheet },
  { href: "/cotizaciones", label: "Cotizaciones", icon: FileCheck2 },
  { href: "/ordenes", label: "Órdenes", icon: Truck },
  { href: "/credito", label: "Crédito y facturación", icon: CreditCard },
  { href: "/listas", label: "Mis listas", icon: ListChecks },
  { href: "/reordenes", label: "Reorden auto", icon: Repeat },
  { href: "/analytics", label: "Spend analytics", icon: BarChart3 },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/perfil", label: "Empresa y equipo", icon: Building2 },
];

// ─── PROVEEDOR (merchant) — solo módulos de venta ───────────────
export const PROVEEDOR_NAV: NavItem[] = [
  { href: "/proveedor/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/proveedor/productos", label: "Mi catálogo", icon: Package },
  { href: "/proveedor/mensajes", label: "Mensajes", icon: MessagesSquare },
  { href: "/proveedor/perfil", label: "Mi cuenta", icon: Building2 },
];

// ─── ADMIN (equipo Novak) — operación del marketplace ───────────
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Inicio", icon: LayoutDashboard, section: "dashboard" },
  { href: "/admin/rfq", label: "Mesa de operaciones", icon: ClipboardList, section: "rfq" },
  { href: "/admin/cotizador", label: "Constructor de cotizaciones", icon: FileSpreadsheet, section: "cotizador" },
  { href: "/admin/ordenes", label: "Órdenes", icon: Truck, section: "ordenes" },
  { href: "/admin/catalogo", label: "Catálogo global", icon: PackageSearch, section: "catalogo" },
  { href: "/admin/proveedores", label: "Proveedores", icon: Store, section: "proveedores" },
  { href: "/admin/compradores", label: "Compradores", icon: Building, section: "compradores" },
  { href: "/admin/credito", label: "Solicitudes de crédito", icon: CreditCard, section: "credito" },
  { href: "/admin/tesoreria", label: "Tesorería", icon: Landmark, section: "tesoreria" },
  { href: "/admin/equipo", label: "Equipo Novak", icon: Users, section: "equipo" },
  { href: "/admin/auditoria", label: "Auditoría", icon: ScrollText, section: "auditoria" },
];

// Para el selector de vistas en modo demo.
export const ROLE_VIEWS = [
  { role: "comprador", label: "Comprador", href: "/dashboard", icon: Building2 },
  { role: "proveedor", label: "Proveedor", href: "/proveedor/dashboard", icon: Store },
  { role: "admin", label: "Novak Admin", href: "/admin/dashboard", icon: ClipboardList },
] as const;
