"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { COMPRADOR_NAV } from "@/components/dashboard/nav-items";
import { DemoViewSwitcher } from "@/components/shared/demo-view-switcher";
import { cn } from "@/lib/utils";

export function Sidebar({ isDemo = false }: { isDemo?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-ink-950 lg:flex">
      <div className="flex h-16 items-center border-b border-ink-800 px-5">
        <Logo variant="light" href="/dashboard" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {COMPRADOR_NAV.map((n) => {
          const active = pathname === n.href || pathname.startsWith(n.href + "/");
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-ink-800 text-white" : "text-ink-300 hover:bg-ink-800/60 hover:text-white",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <DemoViewSwitcher current="comprador" show={isDemo} />
      <div className="border-t border-ink-800 p-3">
        <Link href="/" className="block rounded-lg px-3 py-2 text-xs text-ink-400 hover:text-white">
          ← Volver al sitio público
        </Link>
      </div>
    </aside>
  );
}
