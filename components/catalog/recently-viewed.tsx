"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { useCatalogStore } from "@/lib/catalog/store";
import { mxn } from "@/lib/utils";
import type { Product } from "@/types";

/** Tira de "Vistos recientemente" (desde el store en localStorage). */
export function RecentlyViewed() {
  const { recent } = useCatalogStore();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (recent.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/catalogo/products?ids=${recent.slice(0, 6).join(",")}`)
      .then((r) => r.json())
      .then((d: { products: Product[] }) => {
        // Mantener el orden de "recent".
        const map = new Map(d.products.map((p) => [p.id, p]));
        setProducts(recent.map((id) => map.get(id)).filter(Boolean) as Product[]);
      })
      .catch(() => {});
  }, [recent]);

  if (products.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink-900">
        <History className="size-4 text-safety" /> Vistos recientemente
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/catalogo/${p.id}`}
            className="w-44 shrink-0 rounded-xl border bg-card p-3 transition-shadow hover:shadow-md"
          >
            <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink-900">{p.nombre}</p>
            <p className="mt-1 text-xs text-steel-500">{p.numero_parte}</p>
            <p className="mt-1 font-semibold text-ink-900">{mxn(p.precio_base)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
