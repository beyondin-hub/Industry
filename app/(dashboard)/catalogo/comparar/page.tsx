"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatalogStore } from "@/lib/catalog/store";
import { stockStatus } from "@/lib/catalog/signals";
import { mxn } from "@/lib/utils";
import type { Product } from "@/types";

export default function CompararPage() {
  const { compare, toggleCompare } = useCatalogStore();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (compare.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/catalogo/products?ids=${compare.join(",")}`)
      .then((r) => r.json())
      .then((d: { products: Product[] }) => setProducts(d.products))
      .catch(() => {});
  }, [compare]);

  if (compare.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-10 text-center">
        <GitCompare className="mx-auto size-10 text-steel-300" />
        <p className="mt-3 text-lg font-semibold text-ink-900">No estás comparando productos</p>
        <p className="mt-1 text-sm text-ink-500">Marca “Comparar” en hasta 4 productos del catálogo.</p>
        <Link href="/catalogo" className="mt-4 inline-block">
          <Button variant="accent">Ir al catálogo</Button>
        </Link>
      </div>
    );
  }

  const specKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.especificaciones ?? {}))),
  );
  const cheapest = Math.min(...products.map((p) => p.precio_base));

  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 text-xl font-bold text-ink-900">
        <GitCompare className="size-5 text-safety" /> Comparar productos ({products.length})
      </h1>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <tbody>
            <tr className="border-b">
              <Th>Producto</Th>
              {products.map((p) => (
                <td key={p.id} className="p-3 align-top">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/catalogo/${p.id}`} className="font-semibold text-ink-900 hover:underline">
                      {p.nombre}
                    </Link>
                    <button onClick={() => toggleCompare(p.id)} className="text-steel-400 hover:text-danger" aria-label="Quitar">
                      <X className="size-4" />
                    </button>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-steel-500">{p.numero_parte}</p>
                </td>
              ))}
            </tr>

            <Tr label="Precio base">
              {products.map((p) => (
                <Cell key={p.id} highlight={p.precio_base === cheapest}>
                  {mxn(p.precio_base)} {p.precio_base === cheapest && "✓ más barato"}
                </Cell>
              ))}
            </Tr>

            <Tr label="Stock Tijuana">
              {products.map((p) => (
                <Cell key={p.id}>{stockStatus(p).label}</Cell>
              ))}
            </Tr>

            <Tr label="Marca">
              {products.map((p) => (
                <Cell key={p.id}>{p.marca}</Cell>
              ))}
            </Tr>

            <Tr label="Certificaciones">
              {products.map((p) => (
                <Cell key={p.id}>{p.certificaciones.join(", ") || "—"}</Cell>
              ))}
            </Tr>

            {specKeys.map((k) => (
              <Tr key={k} label={k}>
                {products.map((p) => (
                  <Cell key={p.id}>{p.especificaciones?.[k] ?? "—"}</Cell>
                ))}
              </Tr>
            ))}

            <tr>
              <Th> </Th>
              {products.map((p) => (
                <td key={p.id} className="p-3">
                  <Link href={`/catalogo/${p.id}`}>
                    <Button variant="accent" size="sm" className="w-full">Ver producto</Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <td className="w-40 bg-steel-50 p-3 text-xs font-semibold uppercase tracking-wide text-steel-500">{children}</td>;
}
function Tr({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b">
      <Th>{label}</Th>
      {children}
    </tr>
  );
}
function Cell({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return <td className={`p-3 ${highlight ? "font-semibold text-emerald-700" : "text-ink-700"}`}>{children}</td>;
}
