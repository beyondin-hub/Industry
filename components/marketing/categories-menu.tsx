"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";
import { CATEGORIAS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Disparador "Catálogo" con mega-menú de categorías (hover en desktop, click en touch). */
export function CategoriesMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-medium text-steel-700 transition-colors hover:text-safety"
        aria-expanded={open}
      >
        Catálogo <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 w-[600px] pt-3">
          <div className="rounded-xl border bg-card p-4 shadow-xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              Categorías MRO
            </p>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIAS.map((c) => (
                <Link
                  key={c.slug}
                  href={`/productos?categoria=${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-secondary"
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink-900">{c.nombre}</span>
                    <span className="block truncate text-xs text-ink-500">{c.descripcion}</span>
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <span className="text-xs text-ink-500">
                Catálogos especializados:{" "}
                <Link href="/registro" onClick={() => setOpen(false)} className="font-medium text-safety hover:underline">
                  🏥 NOVAK Med
                </Link>{" "}
                ·{" "}
                <Link href="/registro" onClick={() => setOpen(false)} className="font-medium text-safety hover:underline">
                  💡 NOVAK Electronics
                </Link>
              </span>
              <Link
                href="/productos"
                onClick={() => setOpen(false)}
                className="flex shrink-0 items-center gap-1 text-sm font-semibold text-safety hover:underline"
              >
                Ver todo <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
