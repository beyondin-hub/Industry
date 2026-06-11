"use client";

import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { useCatalogStore } from "@/lib/catalog/store";

/** Barra flotante que aparece cuando hay 2+ productos en comparación. */
export function CompareBar() {
  const { compare, toggleCompare } = useCatalogStore();
  if (compare.length < 2) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit items-center gap-3 rounded-full border bg-card px-4 py-2.5 shadow-xl">
      <span className="flex items-center gap-1.5 text-sm font-medium text-steel-800">
        <GitCompare className="size-4 text-safety" /> Comparando {compare.length} productos
      </span>
      <Link
        href="/catalogo/comparar"
        className="rounded-full bg-safety px-3 py-1.5 text-xs font-semibold text-white hover:bg-safety-600"
      >
        Ver comparación →
      </Link>
      <button
        onClick={() => compare.forEach((id) => toggleCompare(id))}
        className="text-steel-400 hover:text-steel-700"
        aria-label="Limpiar comparación"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
