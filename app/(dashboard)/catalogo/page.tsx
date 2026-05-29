import { PageHeader } from "@/components/dashboard/page-header";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { fetchProducts } from "@/lib/repos/products";
import type { CategoriaMRO } from "@/types";

export const metadata = { title: "Catálogo MRO" };

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string };
}) {
  const q = searchParams.q ?? "";
  const categoria = searchParams.categoria as CategoriaMRO | undefined;

  // El servidor trae el set por búsqueda; las facetas se aplican en cliente
  // para un filtrado instantáneo y animado.
  const products = await fetchProducts({ q: q || undefined });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo MRO"
        description="Stock confirmado en el norte de México · entrega 24–48h en top SKUs · CFDI garantizado"
      />
      <CatalogBrowser products={products} initialCategoria={categoria} q={q} />
    </div>
  );
}
