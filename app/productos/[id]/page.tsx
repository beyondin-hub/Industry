import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/catalog/product-image";
import { ProductCard } from "@/components/catalog/product-card";
import { PublicBuyBox } from "@/components/marketing/public-buybox";
import { fetchProduct, fetchRelated } from "@/lib/repos/products";
import { PRODUCTS } from "@/lib/data/products";
import { categoriaNombre, categoriaEmoji } from "@/lib/constants";

// Pre-renderiza (SSG) las fichas del catálogo demo para SEO y velocidad.
export function generateStaticParams() {
  return PRODUCTS.slice(0, 60).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await fetchProduct(params.id);
  if (!product) return { title: "Producto no encontrado" };

  const desc =
    product.descripcion?.slice(0, 160) ??
    `${product.nombre} (${product.numero_parte}) — ${product.marca}. Precio, stock y entrega 24–48h en el norte de México.`;
  const url = `/productos/${product.id}`;
  const img = product.imagen_url;

  return {
    title: product.nombre,
    description: desc,
    keywords: [product.nombre, product.numero_parte, product.marca, categoriaNombre(product.categoria), "MRO", "industrial"].filter(Boolean) as string[],
    alternates: { canonical: url },
    openGraph: {
      title: `${product.nombre} · Novak`,
      description: desc,
      type: "website",
      url,
      images: img ? [{ url: img }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.nombre,
      description: desc,
      images: img ? [img] : undefined,
    },
  };
}

export default async function ProductoPublicoPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  if (!product) notFound();

  const related = await fetchRelated(product.categoria, product.id, 4);
  const specs = Object.entries(product.especificaciones ?? {});

  // Datos estructurados schema.org/Product para resultados enriquecidos.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nombre,
    sku: product.numero_parte || product.id,
    mpn: product.numero_parte || undefined,
    brand: product.marca ? { "@type": "Brand", name: product.marca } : undefined,
    category: categoriaNombre(product.categoria),
    description: product.descripcion || undefined,
    image: product.imagen_url || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "MXN",
      price: product.precio_base,
      availability: product.stock_actual > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `/productos/${product.id}`,
    },
  };

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
        <Link href="/productos" className="hover:text-safety">Catálogo</Link>
        <ChevronRight className="size-3" />
        <Link href={`/productos?categoria=${product.categoria}`} className="hover:text-safety">
          {categoriaEmoji(product.categoria)} {categoriaNombre(product.categoria)}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-ink-700">{product.nombre}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Info */}
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-[260px_1fr]">
            <div className="h-60 overflow-hidden rounded-xl border">
              <ProductImage
                categoria={product.categoria}
                numeroParte={product.numero_parte}
                marca={product.marca}
                imagenUrl={product.imagen_url}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-safety">{product.marca}</p>
              <h1 className="mt-1 font-display text-2xl font-bold text-ink-950">{product.nombre}</h1>
              <p className="mt-1 font-mono text-sm text-ink-500">{product.numero_parte}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.certificaciones.map((c) => (
                  <Badge key={c} variant="steel" className="text-[11px]">
                    <ShieldCheck className="size-3" /> {c}
                  </Badge>
                ))}
              </div>
              {product.descripcion && (
                <p className="mt-4 text-sm text-ink-600">{product.descripcion}</p>
              )}
            </div>
          </div>

          {/* Especificaciones */}
          {specs.length > 0 && (
            <div className="overflow-hidden rounded-xl border">
              <div className="bg-steel-50 px-4 py-2.5 text-sm font-semibold text-ink-800">
                Especificaciones técnicas
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {specs.map(([k, v], i) => (
                    <tr key={k} className={i % 2 ? "bg-steel-50/50" : ""}>
                      <td className="px-4 py-2 text-ink-600">{k}</td>
                      <td className="px-4 py-2 font-medium text-ink-900">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Documentación (gated) */}
          <div className="rounded-xl border bg-card p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <FileText className="size-4 text-safety" /> Documentación técnica
            </p>
            <p className="mt-1 text-sm text-ink-600">
              Ficha técnica, certificado del proveedor y hoja de seguridad (SDS) disponibles al{" "}
              <Link href="/registro" className="font-medium text-safety hover:underline">crear tu cuenta</Link>.
            </p>
          </div>
        </div>

        {/* Buy box público (sticky) */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <PublicBuyBox product={product} />
        </div>
      </div>

      {/* Relacionados */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-ink-950">Productos relacionados</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} detailBase="/productos" quoteTo="/registro" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
