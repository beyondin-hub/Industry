"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ClipboardCheck, Zap, BookOpen, ChevronRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { COMPRADOR_NAV } from "@/components/dashboard/nav-items";
import { DemoViewSwitcher } from "@/components/shared/demo-view-switcher";
import { cn } from "@/lib/utils";
import type { IndustrySector } from "@/types";

export function MobileNav({
  isDemo = false,
  sector = null,
}: {
  isDemo?: boolean;
  sector?: IndustrySector | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const kit =
    sector?.slug === "medical"
      ? { href: "/herramientas/auditoria", label: "Kit de Auditoría", icon: ClipboardCheck }
      : { href: "/herramientas/linea-smt", label: "Kit de Línea SMT", icon: Zap };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex size-9 items-center justify-center rounded-md text-ink-700 hover:bg-secondary lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-ink-950 shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-ink-800 px-5">
              <Logo variant="light" href="/dashboard" />
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="text-ink-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {COMPRADOR_NAV.map((n) => {
                const active = pathname === n.href || pathname.startsWith(n.href + "/");
                const Icon = n.icon;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active ? "bg-ink-800 text-white" : "text-ink-300 hover:bg-ink-800/60 hover:text-white",
                    )}
                  >
                    <Icon className="size-4 shrink-0" /> {n.label}
                  </Link>
                );
              })}

              {sector && (
                <div className="mt-3 border-t border-ink-800 pt-3">
                  <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
                    {sector.icono} {sector.nombre_brand}
                  </p>
                  {[
                    { href: `/catalogo/sector/${sector.slug}`, label: "Catálogo del sector", icon: ChevronRight },
                    kit,
                    { href: `/guias/${sector.slug}`, label: "Guías Técnicas", icon: BookOpen },
                  ].map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 transition-colors hover:bg-ink-800/60 hover:text-white"
                    >
                      <l.icon className="size-4 shrink-0" /> {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </nav>
            <DemoViewSwitcher current="comprador" show={isDemo} />
            <div className="border-t border-ink-800 p-3">
              <Link href="/" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-xs text-ink-400 hover:text-white">
                ← Volver al sitio público
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
