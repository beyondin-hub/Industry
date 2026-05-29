import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Truck,
  ShieldCheck,
  FileText,
  Box,
  Package,
  MapPin,
  Star,
  Download,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductBuyBox } from "@/components/catalog/product-buybox";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductTabs } from "@/components/catalog/product-tabs";
import { PriceHistoryChart } from "@/components/catalog/price-history-chart";
import { PRODUCTS } from "@/lib/data/products";
import { fetchProduct, fetchRelated } from "@/lib/repos/products";
import { getProvider } from "@/lib/data/providers";
import { categoriaNombre, categoriaEmoji } from "@/lib/constants";
import { entregaLabel, num } from "@/lib/utils";

// Pre-renderiza el catálogo demo; con DB, los SKUs reales se generan on-demand.
export const dynamicParams = true;
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const p = await fetchProduct(params.id);
  return { title: p ? `${p.nombre}` : "Producto" };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  if (!product) notFound();

  const prov = getProvider(product.provider_id);
  const enStock = product.stock_actual > 0;
  const relacionados = await fetchRelated(product.categoria, product.id);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-steel-500">
        <Link href="/catalogo" className="hover:text-safety">Catálogo</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/catalogo?categoria=${product.categoria}`} className="hover:text-safety">
          {categoriaNombre(product.categoria)}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-steel-700">{product.numero_parte}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Main */}
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-[260px_1fr]">
            <div className="flex h-60 items-center justify-center rounded-xl border bg-steel-50 text-steel-300">
              <Package className="size-20" />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm">
                <span className="font-semibold text-safety">{product.marca}</span>
                <span className="text-steel-400">·</span>
                <span className="font-mono text-steel-600">N/P: {product.numero_parte}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-steel-950">{product.nombre}</h1>
              <p className="mt-2 text-sm text-steel-600">{product.descripcion}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {product.certificaciones.map((c) => (
                  <Badge key={c} variant="steel">
                    <ShieldCheck className="size-3" /> {c}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {enStock ? (
                  <Badge variant="success">
                    <Truck className="size-3" /> {entregaLabel(product.tiempo_entrega_horas, prov?.ciudad)}
                  </Badge>
                ) : (
                  <Badge variant="warning">Sobre pedido</Badge>
                )}
                <span className="flex items-center gap-1 text-sm text-steel-600">
                  <Box className="size-4" /> {num(product.stock_actual)} {product.unidad} en stock
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="size-4" /> Ficha técnica (PDF)
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="size-4" /> Plano CAD
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs: specs / certificaciones / documentos / reseñas (McMaster style) */}
          <ProductTabs product={product} />

          {/* Proveedor */}
          {prov && (
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-steel-500">
                    Proveedor verificado
                  </p>
                  <p className="mt-0.5 font-semibold text-steel-900">{prov.nombre_comercial}</p>
                  <p className="flex items-center gap-1 text-sm text-steel-500">
                    <MapPin className="size-3.5" /> {prov.ciudad}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="flex items-center gap-1 text-lg font-bold text-steel-900">
                      <Star className="size-4 fill-amber-400 text-amber-400" /> {prov.score}
                    </p>
                    <p className="text-xs text-steel-500">Score</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {prov.certificaciones.map((c) => (
                      <Badge key={c} variant="success" className="text-[10px]">{c}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Buy box + historial de precio */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <ProductBuyBox product={product} />
          <Card>
            <CardContent className="p-4">
              <PriceHistoryChart base={product.precio_base} id={product.id} />
            </CardContent>
          </Card>
          <Card className="bg-secondary/40">
            <CardContent className="p-4 text-sm">
              <p className="font-semibold text-ink-900">¿No encontraste lo que buscas?</p>
              <p className="mt-1 text-ink-600">Nuestro equipo lo consigue y cotiza en 2h.</p>
              <a href="https://wa.me/526640000000" className="mt-2 inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:underline">
                <MessageCircle className="size-4" /> Escríbenos por WhatsApp
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Relacionados */}
      {relacionados.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-steel-950">
            Otros compradores de maquiladora también vieron
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {relacionados.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
