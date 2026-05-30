"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { ADMIN_NAV } from "@/components/dashboard/nav-items";
import { DemoViewSwitcher } from "@/components/shared/demo-view-switcher";
import { cn } from "@/lib/utils";

export function AdminSidebar({ isDemo = false }: { isDemo?: boolean }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-ink-950 lg:flex">
      <div className="flex h-16 items-center border-b border-ink-800 px-5">
        <Logo variant="light" href="/admin/dashboard" />
      </div>
      <div className="px-5 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-safety/20 px-2.5 py-1 text-[11px] font-semibold text-safety">
          Mesa de operaciones Novak
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV.map((n) => {
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
              <Icon className="size-4 shrink-0" /> {n.label}
            </Link>
          );
        })}
      </nav>
      <DemoViewSwitcher current="admin" show={isDemo} />
      <div className="border-t border-ink-800 p-3">
        <Link href="/" className="block rounded-lg px-3 py-2 text-xs text-ink-400 hover:text-white">
          ← Salir del panel
        </Link>
      </div>
    </aside>
  );
}
