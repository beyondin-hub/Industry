import Link from "next/link";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { SmartSearch } from "@/components/catalog/smart-search";
import { fetchProducts } from "@/lib/repos/products";
import type { CategoriaMRO } from "@/types";

export const metadata = { title: "Resultados · Catálogo Novak" };

export default async function ProductosBusquedaPage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string };
}) {
  const q = searchParams.q ?? "";
  const categoria = searchParams.categoria as CategoriaMRO | undefined;
  const products = await fetchProducts({ q: q || undefined });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5">
        <h1 className="font-display text-xl font-bold text-ink-950">
          {q ? `Resultados para “${q}”` : "Catálogo MRO"}
        </h1>
        <div className="mt-3 max-w-xl">
          <SmartSearch basePath="/productos" placeholder="Refina tu búsqueda…" />
        </div>
      </div>

      <CatalogBrowser
        products={products}
        initialCategoria={categoria}
        q={q}
        detailBase="/productos"
        quoteTo="/registro"
        searchAction="/productos/busqueda"
      />

      <p className="text-center text-sm text-ink-600">
        <Link href="/productos" className="font-medium text-safety hover:underline">
          ← Ver todo el catálogo
        </Link>
      </p>
    </div>
  );
}
