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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

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

export const OPERACIONES_NAV: NavItem[] = [
  { href: "/proveedor/dashboard", label: "Portal proveedor", icon: Store },
  { href: "/admin/rfq", label: "Mesa de operaciones", icon: ClipboardList },
];
