import Link from "next/link";
import { Zap, Truck, ShieldCheck, CreditCard, ArrowRight, Upload, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SmartSearch } from "@/components/catalog/smart-search";
import { RecentlyViewed } from "@/components/catalog/recently-viewed";
import { QuickAddButton } from "@/components/catalog/quick-add-button";
import { fetchProducts } from "@/lib/repos/products";
import { getActiveSector } from "@/lib/sector/context";
import { firstVolumeBreak, stockStatus } from "@/lib/catalog/signals";
import { CATEGORIAS } from "@/lib/constants";
import { mxn } from "@/lib/utils";

export const metadata = { title: "Catálogo · Novak" };

const FRECUENTES = ["sku-6205", "sku-guante-nitrilo", "sku-grasa-ep2", "sku-aceite-iso46"];

export default async function CatalogoHomePage() {
  const [products, { sector, configured }] = await Promise.all([fetchProducts(), getActiveSector()]);

  const countByCat = (slug: string) => products.filter((p) => p.categoria === slug).length;
  const frecuentes = FRECUENTES.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const ofertas = products
    .map((p) => ({ p, vb: firstVolumeBreak(p) }))
    .filter((x) => x.vb && x.vb.pct >= 10)
    .sort((a, b) => (b.vb!.pct - a.vb!.pct))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero search */}
      <section className="rounded-2xl border bg-gradient-to-br from-ink-950 to-ink-900 p-6 text-white sm:p-8">
        <h1 className="text-2xl font-bold sm:text-3xl">El catálogo MRO más completo del norte de México</h1>
        <p className="mt-1 text-sm text-paper-100/70">
          Número de parte, descripción o marca — encuéntralo y cotízalo en minutos.
        </p>
        <div className="mt-4 max-w-xl [&_input]:bg-white">
          <SmartSearch placeholder="Busca por número de parte, descripción o marca…" />
        </div>
        <p className="mt-3 text-xs text-paper-100/50">
          Popular esta semana: Rodamientos SKF · Guante nitrilo · IPA 99% · Stretch film · Lubricante VG46
        </p>
      </section>

      {/* Garantía banner */}
      <section className="grid gap-3 rounded-xl border bg-safety-50 p-4 text-sm font-medium text-ink-800 sm:grid-cols-4">
        <span className="flex items-center gap-2"><Zap className="size-4 text-safety" /> Cotización en 2 horas</span>
        <span className="flex items-center gap-2"><Truck className="size-4 text-safety" /> Entrega en Tijuana 24h</span>
        <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-safety" /> Proveedores ISO/NOM</span>
        <span className="flex items-center gap-2"><CreditCard className="size-4 text-safety" /> Crédito B2B disponible</span>
      </section>

      {/* Promo de sector / importar lista */}
      <section className="grid gap-3 sm:grid-cols-2">
        {!sector && configured ? (
          <div className="rounded-xl border p-4">
            <p className="text-sm font-semibold text-ink-900">¿Manufactura médica o electrónica?</p>
            <p className="mt-0.5 text-xs text-ink-500">Tenemos catálogos especializados con certificación y filtros técnicos.</p>
            <div className="mt-3 flex gap-2">
              <Link href="/catalogo/sector/medical"><Button size="sm" variant="outline">🏥 NOVAK Med</Button></Link>
              <Link href="/catalogo/sector/electronics"><Button size="sm" variant="outline">💡 NOVAK Electronics</Button></Link>
            </div>
          </div>
        ) : (
          sector && (
            <Link href={`/catalogo/sector/${sector.slug}`} className="rounded-xl border p-4 transition-colors hover:border-ink-300">
              <p className="text-sm font-semibold" style={{ color: sector.color_primario }}>{sector.icono} {sector.nombre_brand}</p>
              <p className="mt-0.5 text-xs text-ink-500">Tu catálogo especializado con filtros técnicos →</p>
            </Link>
          )
        )}
        <Link href="/catalogo/importar" className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:border-ink-300">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Upload className="size-4" /> Importar lista de compra</p>
            <p className="mt-0.5 text-xs text-ink-500">Pega o sube tu lista (CSV) y la cotizamos completa.</p>
          </div>
          <ArrowRight className="size-4 text-steel-400" />
        </Link>
      </section>

      {/* Compra de nuevo */}
      {frecuentes.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-ink-900">Compra de nuevo — lo que más pides</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {frecuentes.map((p) => {
              const st = stockStatus(p!);
              return (
                <div key={p!.id} className="flex flex-col rounded-xl border bg-card p-3">
                  <Link href={`/catalogo/${p!.id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink-900 hover:underline">
                    {p!.nombre}
                  </Link>
                  <p className="mt-1 text-xs text-emerald-600">{st.label}</p>
                  <p className="mt-1 font-bold text-ink-900">{mxn(p!.precio_base)}<span className="text-xs font-normal text-steel-500">/{p!.unidad}</span></p>
                  <div className="mt-2"><QuickAddButton id={p!.id} cantidad={1} /></div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Categorías principales */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-ink-900">Categorías principales</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.slug}
              href={`/catalogo/busqueda?categoria=${c.slug}`}
              className="rounded-xl border bg-card p-4 text-center transition-shadow hover:shadow-md"
            >
              <div className="text-2xl">{c.emoji}</div>
              <p className="mt-1 text-sm font-medium text-ink-900">{c.nombre}</p>
              <p className="text-xs text-steel-500">{countByCat(c.slug)} SKUs</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Ofertas por volumen */}
      {ofertas.length > 0 && (
        <section>
          <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-ink-900">
            <Tag className="size-4 text-safety" /> Mejores precios por volumen
          </h2>
          <p className="mb-3 text-xs text-ink-500">Ahorra comprando en cantidad · descuentos escalonados</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ofertas.map(({ p, vb }) => (
              <div key={p.id} className="flex flex-col rounded-xl border bg-card p-3">
                <Badge variant="danger" className="w-fit text-[10px]">−{vb!.pct}% desde {vb!.cantidad}</Badge>
                <Link href={`/catalogo/${p.id}`} className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink-900 hover:underline">
                  {p.nombre}
                </Link>
                <p className="mt-1 text-xs text-steel-500 line-through">{mxn(p.precio_base)}</p>
                <p className="font-bold text-emerald-700">{mxn(vb!.precio)}<span className="text-xs font-normal text-steel-500">/{p.unidad}</span></p>
                <div className="mt-2"><QuickAddButton id={p.id} cantidad={vb!.cantidad} label="Agregar al volumen" /></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Vistos recientemente (cliente) */}
      <RecentlyViewed />
    </div>
  );
}
