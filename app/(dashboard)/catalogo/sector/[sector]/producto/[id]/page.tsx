import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  CheckCircle2,
  MapPin,
  Clock,
  Plus,
  Repeat,
  MessageCircle,
  FileText,
  Download,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  fetchSector,
  fetchSectorProduct,
  fetchSectorCategories,
  fetchRelatedSectorProducts,
} from "@/lib/repos/sectors";
import { SECTOR_SLUGS } from "@/lib/sector/context";
import { ProductCardSector } from "@/components/sector/product-card-sector";
import { mxn, entregaLabel } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await fetchSectorProduct(params.id);
  return { title: product ? product.nombre : "Producto" };
}

export default async function SectorProductPage({
  params,
}: {
  params: { sector: string; id: string };
}) {
  if (!SECTOR_SLUGS.includes(params.sector as (typeof SECTOR_SLUGS)[number])) notFound();
  const [sector, product] = await Promise.all([
    fetchSector(params.sector),
    fetchSectorProduct(params.id),
  ]);
  if (!sector || !product || product.sector_slug !== sector.slug) notFound();

  const [categories, related] = await Promise.all([
    fetchSectorCategories(sector.slug),
    fetchRelatedSectorProducts(sector.slug, product.category_slug, product.id),
  ]);
  const category = categories.find((c) => c.slug === product.category_slug);
  const color = sector.color_primario;
  const specTitle = sector.slug === "medical" ? "Especificación Médica" : "Especificación Electrónica";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
        <Link href={`/catalogo/sector/${sector.slug}`} className="hover:underline" style={{ color }}>
          {sector.nombre_brand}
        </Link>
        <ChevronRight className="size-3" />
        {category && (
          <>
            <Link
              href={`/catalogo/sector/${sector.slug}?category=${category.slug}`}
              className="hover:underline"
            >
              {category.nombre}
            </Link>
            <ChevronRight className="size-3" />
          </>
        )}
        <span className="text-ink-700">{product.nombre}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Columna izquierda */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-1.5">
            {product.badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ color, backgroundColor: `${color}14` }}
              >
                {b}
              </span>
            ))}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-ink-900">{product.nombre}</h1>
            <p className="mt-1 text-sm text-ink-500">
              {product.marca ? `${product.marca} · ` : ""}SKU {product.sku}
            </p>
          </div>

          <p className="text-sm text-ink-700">{product.uso_sector}</p>

          {/* Especificaciones técnicas completas */}
          <div className="overflow-hidden rounded-xl border">
            <div
              className="px-4 py-2.5 text-sm font-semibold"
              style={{ color, backgroundColor: `${color}14` }}
            >
              Especificaciones técnicas
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-ink-400">
                  <th className="px-4 py-2 font-medium">{specTitle}</th>
                  <th className="px-4 py-2 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(product.atributos_tecnicos).map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? "bg-steel-50/50" : ""}>
                    <td className="px-4 py-2 text-ink-600">{k}</td>
                    <td className="px-4 py-2 font-medium text-ink-900">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Usos recomendados */}
          {product.usos_recomendados && product.usos_recomendados.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-ink-900">
                Usos recomendados en tu industria
              </h2>
              <ul className="space-y-1.5">
                {product.usos_recomendados.map((u) => (
                  <li key={u} className="flex items-start gap-2 text-sm text-ink-700">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" style={{ color }} />
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Columna derecha (sticky) */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-4 rounded-xl border bg-card p-5">
            <div>
              <p className="text-2xl font-bold text-ink-900">
                {mxn(product.precio)}{" "}
                <span className="text-sm font-normal text-ink-500">/ {product.unidad}</span>
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle2 className="size-4" />
                {product.en_stock_tj ? (
                  <>
                    <MapPin className="size-3.5" /> En stock · TJ · {product.stock_actual} unidades
                  </>
                ) : (
                  "Bajo pedido"
                )}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                <Clock className="size-3.5" /> {entregaLabel(product.tiempo_entrega_horas, "Tijuana")}
              </p>
            </div>

            <div className="space-y-2">
              <Link href={`/cotizar?producto=${product.id}`} className="block">
                <Button variant="accent" className="w-full">
                  <Plus className="size-4" /> Agregar a cotización
                </Button>
              </Link>
              <Link href={`/reordenes?producto=${product.id}`} className="block">
                <Button variant="outline" className="w-full">
                  <Repeat className="size-4" /> Reorden automático con 5% descuento
                </Button>
              </Link>
              <a href="https://wa.me/5216641234567" className="block">
                <Button variant="ghost" className="w-full text-ink-600">
                  <MessageCircle className="size-4" /> Preguntar a Novak por WhatsApp
                </Button>
              </a>
            </div>

            {/* Documentación */}
            {product.documentos && product.documentos.length > 0 && (
              <div className="border-t pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Documentación disponible
                </p>
                <ul className="space-y-1.5">
                  {product.documentos.map((d) => (
                    <li key={d.nombre} className="flex items-center gap-2 text-sm text-ink-700">
                      <FileText className="size-4 shrink-0" style={{ color }} /> {d.nombre}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  <Download className="size-3.5" />
                  {sector.slug === "medical" ? "Descargar todo (.ZIP auditoría)" : "Descargar todo"}
                </Button>
              </div>
            )}

            {/* Proveedor */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span className="text-sm font-medium text-ink-800">
                  Proveedor verificado {sector.nombre_brand}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                <Star className="size-3.5 fill-amber-400 text-amber-400" /> 9.8/10 score Novak
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-ink-900">
            Productos relacionados de {sector.nombre_brand}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((p) => (
              <ProductCardSector key={p.id} product={p} color={color} />
            ))}
          </div>
        </section>
      )}

      <div>
        <Link
          href={`/catalogo/sector/${sector.slug}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Volver al catálogo {sector.nombre_brand}
        </Link>
      </div>
    </div>
  );
}
