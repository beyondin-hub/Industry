import Link from "next/link";
import { ShieldCheck, Zap, Truck } from "lucide-react";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { SmartSearch } from "@/components/catalog/smart-search";
import { fetchProducts } from "@/lib/repos/products";
import type { CategoriaMRO } from "@/types";

export const metadata = {
  title: "Catálogo MRO industrial · Novak",
  description:
    "Explora miles de insumos MRO con precio, stock y entrega 24–48h en el norte de México. Sin registro para ver precios.",
};

export default async function ProductosPublicPage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const products = await fetchProducts();
  const categoria = searchParams.categoria as CategoriaMRO | undefined;

  return (
    <div className="space-y-6">
      {/* Hero de catálogo público */}
      <section className="rounded-2xl border bg-gradient-to-br from-ink-950 to-ink-900 p-6 text-white sm:p-8">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Catálogo MRO industrial</h1>
        <p className="mt-1 text-sm text-paper-100/70">
          Precio, stock y entrega reales — sin registro para ver precios.
        </p>
        <div className="mt-4 max-w-xl [&_input]:bg-white">
          <SmartSearch basePath="/productos" placeholder="Número de parte, descripción o marca…" />
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-paper-100/70">
          <span className="flex items-center gap-1.5"><Zap className="size-3.5" /> Cotización en 2h</span>
          <span className="flex items-center gap-1.5"><Truck className="size-3.5" /> Entrega 24–48h</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Proveedores certificados</span>
        </div>
      </section>

      <CatalogBrowser
        products={products}
        initialCategoria={categoria}
        detailBase="/productos"
        quoteTo="/registro"
        searchAction="/productos/busqueda"
      />

      <p className="rounded-xl border bg-card p-4 text-center text-sm text-ink-600">
        ¿Listo para cotizar o comprar?{" "}
        <Link href="/registro" className="font-semibold text-safety hover:underline">
          Crea tu cuenta gratis
        </Link>{" "}
        — cotización garantizada en 2 horas, crédito B2B y CFDI automático.
      </p>
    </div>
  );
}
