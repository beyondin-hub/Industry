import { PageHeader } from "@/components/dashboard/page-header";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { fetchProducts } from "@/lib/repos/products";
import type { CategoriaMRO } from "@/types";

export const metadata = { title: "Resultados · Catálogo MRO" };

export default async function BusquedaPage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string };
}) {
  const q = searchParams.q ?? "";
  const categoria = searchParams.categoria as CategoriaMRO | undefined;
  const products = await fetchProducts({ q: q || undefined });

  return (
    <div className="space-y-6">
      <PageHeader
        title={q ? `Resultados para “${q}”` : "Catálogo MRO"}
        description="Stock confirmado en el norte de México · entrega 24–48h en top SKUs · CFDI garantizado"
      />
      <CatalogBrowser products={products} initialCategoria={categoria} q={q} />
    </div>
  );
}
