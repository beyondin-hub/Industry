"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  FileSpreadsheet,
  Truck,
  BarChart3,
  Repeat,
  ListChecks,
  Building2,
  Store,
  ClipboardList,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const COMPRADOR = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/catalogo", label: "Catálogo MRO", icon: PackageSearch },
  { href: "/cotizar", label: "Cotizar (RFQ)", icon: FileSpreadsheet },
  { href: "/ordenes", label: "Órdenes", icon: Truck },
  { href: "/listas", label: "Mis listas", icon: ListChecks },
  { href: "/reordenes", label: "Reorden auto", icon: Repeat },
  { href: "/analytics", label: "Spend analytics", icon: BarChart3 },
  { href: "/perfil", label: "Empresa y equipo", icon: Building2 },
];

const OPERACIONES = [
  { href: "/proveedor/dashboard", label: "Portal proveedor", icon: Store },
  { href: "/admin/rfq", label: "Mesa de operaciones", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();

  const item = (href: string, label: string, Icon: any) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-steel-800 text-white"
            : "text-steel-300 hover:bg-steel-800/60 hover:text-white",
        )}
      >
        <Icon className="size-4 shrink-0" />
        {label}
      </Link>
    );
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-steel-950 lg:flex">
      <div className="flex h-16 items-center border-b border-steel-800 px-5">
        <Logo variant="light" href="/dashboard" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {COMPRADOR.map((n) => item(n.href, n.label, n.icon))}
        <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-steel-600">
          Operaciones MROLink
        </p>
        {OPERACIONES.map((n) => item(n.href, n.label, n.icon))}
      </nav>
      <div className="border-t border-steel-800 p-3">
        <Link
          href="/"
          className="block rounded-lg px-3 py-2 text-xs text-steel-400 hover:text-white"
        >
          ← Volver al sitio público
        </Link>
      </div>
    </aside>
  );
}
