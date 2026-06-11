"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight, MessageCircle } from "lucide-react";
import { CATEGORIAS, BRAND } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Menú móvil (drawer) del header público: categorías + navegación + auth. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex size-9 items-center justify-center rounded-md text-steel-700 hover:bg-secondary md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={close} />
          <aside className="absolute right-0 top-0 flex h-full w-80 max-w-[85%] flex-col bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <span className="font-display font-bold text-ink-900">Menú</span>
              <button onClick={close} aria-label="Cerrar" className="text-steel-500 hover:text-ink-900">
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Categorías</p>
                <div className="space-y-0.5">
                  {CATEGORIAS.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/productos?categoria=${c.slug}`}
                      onClick={close}
                      className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-ink-800 hover:bg-secondary"
                    >
                      <span>{c.emoji} {c.nombre}</span>
                      <ChevronRight className="size-4 text-ink-300" />
                    </Link>
                  ))}
                  <Link href="/productos" onClick={close} className="block px-2 py-2 text-sm font-semibold text-safety">
                    Ver todo el catálogo →
                  </Link>
                </div>
              </div>

              <div className="space-y-0.5 border-t pt-4">
                <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Catálogos especializados</p>
                <Link href="/registro" onClick={close} className="block rounded-lg px-2 py-2 text-sm text-ink-800 hover:bg-secondary">🏥 NOVAK Med</Link>
                <Link href="/registro" onClick={close} className="block rounded-lg px-2 py-2 text-sm text-ink-800 hover:bg-secondary">💡 NOVAK Electronics</Link>
              </div>

              <div className="space-y-0.5 border-t pt-4">
                <Link href="/vender" onClick={close} className="block rounded-lg px-2 py-2 text-sm text-ink-800 hover:bg-secondary">Para proveedores</Link>
                <a href={BRAND.whatsappLink} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-emerald-700">
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
              </div>
            </div>

            <div className="space-y-2 border-t p-4">
              <Link href="/login" onClick={close} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                Iniciar sesión
              </Link>
              <Link href="/registro" onClick={close} className={cn(buttonVariants({ variant: "accent" }), "w-full")}>
                Crear cuenta
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
