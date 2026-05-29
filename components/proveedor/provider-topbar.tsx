"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, Star, Store } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/proveedor/dashboard", label: "Inicio" },
  { href: "/proveedor/productos", label: "Mi catálogo" },
  { href: "/proveedor/mensajes", label: "Mensajes" },
  { href: "/proveedor/perfil", label: "Mi cuenta" },
];

export function ProviderTopbar({ nombre, ciudad, score }: { nombre: string; ciudad: string; score: number }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/90 px-4 backdrop-blur lg:px-6">
      <button onClick={() => setOpen(true)} className="flex size-9 items-center justify-center rounded-md text-ink-700 hover:bg-secondary lg:hidden" aria-label="Menú">
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <Badge variant="success" className="hidden sm:inline-flex"><Star className="size-3 fill-current" /> {score.toFixed(1)}</Badge>
        <div className="flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-ink-900">{nombre}</p>
            <p className="flex items-center justify-end gap-1 text-xs text-ink-500"><Store className="size-3 text-safety" /> {ciudad}</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full gradient-accent text-sm font-bold text-white">
            {nombre.slice(0, 2).toUpperCase()}
          </div>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="flex size-9 items-center justify-center rounded-md text-ink-500 hover:bg-secondary hover:text-ink-800" aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut className="size-5" />
          </button>
        </form>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-ink-950 shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-ink-800 px-5">
              <Logo variant="light" href="/proveedor/dashboard" />
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="text-ink-400 hover:text-white"><X className="size-5" /></button>
            </div>
            <nav className="flex-1 space-y-1 p-3">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-ink-800/60 hover:text-white">
                  {n.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
