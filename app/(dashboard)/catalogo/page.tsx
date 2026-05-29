import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS, searchProducts } from "@/lib/data/products";
import { CATEGORIAS, categoriaNombre } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CategoriaMRO } from "@/types";

export const metadata = { title: "Catálogo MRO" };

export default function CatalogoPage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string };
}) {
  const q = searchParams.q ?? "";
  const categoria = searchParams.categoria as CategoriaMRO | undefined;

  let results = q ? searchProducts(q) : PRODUCTS;
  if (categoria) results = results.filter((p) => p.categoria === categoria);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo MRO"
        description="Stock confirmado en el norte de México · entrega 24–48h en top SKUs"
      />

      {/* Search bar */}
      <form action="/catalogo" className="flex items-center gap-2 rounded-xl border bg-white p-2 shadow-sm">
        <Search className="ml-2 size-5 shrink-0 text-steel-400" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Quick order: número de parte, marca, descripción…"
          className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-steel-400"
        />
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <Button type="submit" variant="accent">Buscar</Button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Filtros */}
        <aside className="space-y-5">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-steel-700">
              <SlidersHorizontal className="size-4" /> Categorías
            </p>
            <div className="space-y-1">
              <Link
                href={q ? `/catalogo?q=${q}` : "/catalogo"}
                className={cn(
                  "block rounded-md px-3 py-1.5 text-sm transition-colors",
                  !categoria ? "bg-steel-900 text-white" : "text-steel-600 hover:bg-secondary",
                )}
              >
                Todas
              </Link>
              {CATEGORIAS.map((c) => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                params.set("categoria", c.slug);
                return (
                  <Link
                    key={c.slug}
                    href={`/catalogo?${params.toString()}`}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                      categoria === c.slug
                        ? "bg-steel-900 text-white"
                        : "text-steel-600 hover:bg-secondary",
                    )}
                  >
                    <span>{c.emoji}</span> {c.nombre}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Resultados */}
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-steel-600">
            <span className="font-semibold text-steel-900">{results.length}</span> productos
            {categoria && (
              <Badge variant="steel">{categoriaNombre(categoria)}</Badge>
            )}
            {q && <Badge variant="accent">“{q}”</Badge>}
          </div>

          {results.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-white py-16 text-center">
              <p className="text-steel-600">
                No encontramos “{q}”. ¿No tienes el número de parte?
              </p>
              <Link href="/cotizar" className="mt-3 inline-block">
                <Button variant="accent">Solicitar cotización con foto del componente</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
