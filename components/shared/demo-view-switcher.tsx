import Link from "next/link";
import { ROLE_VIEWS } from "@/components/dashboard/nav-items";
import { cn } from "@/lib/utils";

/**
 * Selector de vistas SOLO en modo demo (sin Supabase configurado).
 * Permite explorar los 3 portales. Con sesión real no se muestra:
 * cada usuario ve únicamente los módulos de su rol.
 */
export function DemoViewSwitcher({ current, show }: { current: "comprador" | "proveedor" | "admin"; show: boolean }) {
  if (!show) return null;
  return (
    <div className="border-t border-ink-800 p-3">
      <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-600">
        Vistas de demostración
      </p>
      <div className="grid grid-cols-3 gap-1">
        {ROLE_VIEWS.map((v) => {
          const active = v.role === current;
          const Icon = v.icon;
          return (
            <Link
              key={v.role}
              href={v.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] font-medium transition-colors",
                active ? "bg-ink-800 text-white" : "text-ink-400 hover:bg-ink-800/60 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              {v.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
