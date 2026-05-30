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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
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
export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/rfq", label: "Mesa de operaciones", icon: ClipboardList },
  { href: "/admin/cotizador", label: "Constructor de cotizaciones", icon: FileSpreadsheet },
  { href: "/admin/proveedores", label: "Proveedores", icon: Store },
  { href: "/admin/tesoreria", label: "Tesorería y crédito", icon: Landmark },
];

// Para el selector de vistas en modo demo.
export const ROLE_VIEWS = [
  { role: "comprador", label: "Comprador", href: "/dashboard", icon: Building2 },
  { role: "proveedor", label: "Proveedor", href: "/proveedor/dashboard", icon: Store },
  { role: "admin", label: "Novak Admin", href: "/admin/dashboard", icon: ClipboardList },
] as const;
