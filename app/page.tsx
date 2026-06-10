import Link from "next/link";
import {
  Clock,
  Truck,
  CreditCard,
  ShieldCheck,
  FileText,
  MessageCircle,
  ArrowRight,
  Zap,
  Quote,
  Store,
  Flame,
  Tag,
  MapPin,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { DowntimeCalculator } from "@/components/marketing/downtime-calculator";
import { SupplierScorecard } from "@/components/shared/supplier-scorecard";
import { ProductCard } from "@/components/catalog/product-card";
import { SmartSearch } from "@/components/catalog/smart-search";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIAS, BRAND } from "@/lib/constants";
import { fetchSiteContent } from "@/lib/repos/content";
import { fetchProducts } from "@/lib/repos/products";
import { firstVolumeBreak, socialProof } from "@/lib/catalog/signals";
import { PROVIDERS } from "@/lib/data/providers";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const MARCAS = ["SKF", "SMC", "FESTO", "3M", "MOBIL", "SIEMENS", "BOSCH", "PARKER", "MITUTOYO", "SCHNEIDER", "NSK", "GATES"];

const PILARES = [
  { icon: Clock, t: "Cotización en 2 horas", d: "Garantía o tu siguiente orden con 0% comisión.", color: "text-purplecow" },
  { icon: Truck, t: "Entrega 24–48h", d: "Top 200 SKUs con stock propio confirmado.", color: "text-safety" },
  { icon: CreditCard, t: "Crédito B2B en 24h", d: "Línea preaprobada 30/60/90 días vía SOFOM.", color: "text-emerald-700" },
  { icon: ShieldCheck, t: "100% certificados", d: "ISO 9001, IATF 16949, ISO 13485 y NOM.", color: "text-info" },
];

const PASOS = [
  { n: "01", t: "Busca o solicita", d: "Pega números de parte, sube tu lista o describe el problema — incluso con foto del componente." },
  { n: "02", t: "Cotizamos en 2h", d: "Nuestra mesa consigue precios de proveedores certificados en menos de 2 horas hábiles." },
  { n: "03", t: "Recibes en planta", d: "Aprueba con un clic, paga de contado o a crédito y recibe en 24–48h con CFDI." },
];

const TESTIMONIOS = [
  { quote: "Pasamos de esperar 3 días por cotización a tenerla antes de comer. Una válvula a tiempo evitó parar la línea de ensamble.", nombre: "Jorge Medina", cargo: "Gerente de Compras", empresa: "Automotriz Tier 1, Tijuana", ini: "JM" },
  { quote: "El crédito a 60 días nos cambió el flujo. Y todo llega con CFDI, sin perseguir facturas con cada distribuidor.", nombre: "Daniela Ruiz", cargo: "Jefa de Abastecimiento", empresa: "Electrónica, Mexicali", ini: "DR" },
  { quote: "El reorden automático de EPP y lubricantes nos quitó trabajo manual. Nunca más nos quedamos sin guantes a media producción.", nombre: "Carlos Esquivel", cargo: "Jefe de Mantenimiento", empresa: "Manufactura, Cd. Juárez", ini: "CE" },
];

function Rail({
  title,
  sub,
  icon: Icon,
  products,
  href,
}: {
  title: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  products: Product[];
  href: string;
}) {
  if (products.length === 0) return null;
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">
            <Icon className="size-5 text-safety" /> {title}
          </h2>
          <p className="mt-0.5 text-sm text-ink-600">{sub}</p>
        </div>
        <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-safety hover:underline sm:flex">
          Ver todos <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
        {products.map((p) => (
          <div key={p.id} className="w-[260px] shrink-0">
            <ProductCard product={p} detailBase="/productos" quoteTo="/registro" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function LandingPage() {
  const [content, products] = await Promise.all([fetchSiteContent(), fetchProducts()]);
  const proveedores = PROVIDERS.slice(0, 6);

  // Rieles de producto en vivo (datos reales del catálogo).
  const masPedidosRaw = products.filter((p) => socialProof(p));
  const masPedidos = (masPedidosRaw.length >= 4 ? masPedidosRaw : products).slice(0, 10);
  const mejorVolumen = products
    .map((p) => ({ p, vb: firstVolumeBreak(p) }))
    .filter((x) => x.vb && x.vb.pct >= 10)
    .sort((a, b) => b.vb!.pct - a.vb!.pct)
    .map((x) => x.p)
    .slice(0, 10);
  const enStock = products.filter((p) => p.stock_actual > 100).slice(0, 10);
  const countByCat = (slug: string) => products.filter((p) => p.categoria === slug).length;

  return (
    <div className="flex min-h-screen flex-col">
      {content.banner.activo && (
        <div className="bg-ink-950 px-4 py-2 text-center text-sm text-white">{content.banner.texto}</div>
      )}
      <SiteHeader />
      <main className="flex-1">
        {/* ─── HERO marketplace-first ─── */}
        <section className="relative overflow-hidden bg-ink-950 text-white">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute inset-0 glow-accent" />
          <div className="absolute inset-0 bg-noise opacity-40" />
          <div className="container relative py-16 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mx-auto border border-gold/30 bg-gold/10 px-3 py-1 text-sm text-gold">
                <Zap className="size-3.5" /> Cotización en 2h garantizada o 0% comisión
              </Badge>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                El marketplace MRO de la{" "}
                <span className="text-gradient">maquiladora mexicana</span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-ink-300">
                Miles de insumos industriales con precio, stock y entrega reales. Busca, compara y cotiza
                en minutos — sin registro para ver precios.
              </p>

              {/* Buscador protagonista */}
              <div className="mx-auto mt-7 max-w-2xl [&_input]:h-12 [&_input]:!bg-white [&_input]:text-base">
                <SmartSearch basePath="/productos" placeholder="Número de parte, descripción o marca… ej. 6205-2RS, guante nitrilo" />
              </div>

              {/* Pills de categorías */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {CATEGORIAS.slice(0, 6).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/productos?categoria=${c.slug}`}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-ink-200 transition-colors hover:border-safety hover:text-white"
                  >
                    {c.emoji} {c.nombre}
                  </Link>
                ))}
              </div>

              <div className="mx-auto mt-9 grid max-w-2xl grid-cols-3 gap-4">
                {[
                  { v: "$8.4B", s: "mercado MRO México" },
                  { v: "6,000+", s: "maquiladoras activas" },
                  { v: "<2h", s: "cotización garantizada" },
                ].map((m) => (
                  <div key={m.s}>
                    <p className="font-display text-3xl font-extrabold">{m.v}</p>
                    <p className="text-xs text-ink-400">{m.s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── TRUST marquee ─── */}
        <section className="border-b bg-card py-7">
          <div className="container">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-ink-400">
              Distribuimos marcas líderes · Proveedores certificados · CFDI garantizado · Crédito B2B
            </p>
            <div className="relative overflow-hidden">
              <div className="flex w-max animate-marquee items-center gap-12">
                {[...MARCAS, ...MARCAS].map((m, i) => (
                  <span key={i} className="font-display text-xl font-bold text-ink-300">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CATEGORÍAS ─── */}
        <section id="categorias" className="border-b py-12">
          <div className="container">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink-950">Compra por categoría</h2>
              <Link href="/productos" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Ver catálogo completo <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {CATEGORIAS.map((c) => (
                <Link
                  key={c.slug}
                  href={`/productos?categoria=${c.slug}`}
                  className="group rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-safety hover:shadow-md"
                >
                  <div className="mb-3 text-3xl">{c.emoji}</div>
                  <h3 className="text-sm font-semibold text-ink-900 group-hover:text-safety">{c.nombre}</h3>
                  <p className="mt-0.5 text-xs text-ink-500">{countByCat(c.slug)} productos</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── RIELES DE PRODUCTO EN VIVO ─── */}
        <section className="border-b bg-paper-300 py-12">
          <div className="container space-y-10">
            <Rail
              title="Más pedidos esta semana"
              sub="Lo que más compran las maquiladoras de la frontera"
              icon={Flame}
              products={masPedidos}
              href="/productos"
            />
            <Rail
              title="Mejores precios por volumen"
              sub="Ahorra más comprando en cantidad — descuentos escalonados"
              icon={Tag}
              products={mejorVolumen}
              href="/productos"
            />
            <Rail
              title="En stock en Tijuana"
              sub="Disponible para entrega 24–48h"
              icon={MapPin}
              products={enStock}
              href="/productos"
            />
          </div>
        </section>

        {/* ─── GARANTÍA strip ─── */}
        <section className="border-b py-12">
          <div className="container">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PILARES.map((v) => (
                <Card key={v.t} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <v.icon className={cn("mb-3 size-8", v.color)} />
                    <h3 className="mb-1 font-semibold text-ink-900">{v.t}</h3>
                    <p className="text-sm text-ink-600">{v.d}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CÓMO FUNCIONA ─── */}
        <section id="como-funciona" className="border-b bg-paper-300 py-12">
          <div className="container">
            <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-ink-950">Cómo funciona</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {PASOS.map((p, i) => (
                <div key={p.n} className="relative">
                  <span className="font-display text-5xl font-extrabold text-safety/25">{p.n}</span>
                  <h3 className="mt-2 font-display text-xl font-semibold text-ink-900">{p.t}</h3>
                  <p className="mt-2 text-ink-600">{p.d}</p>
                  {i < PASOS.length - 1 && (
                    <ArrowRight className="absolute -right-4 top-8 hidden size-6 text-ink-300 md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CALCULADORA DE PARO ─── */}
        <section className="border-b py-12">
          <div className="container">
            <div className="mb-6 max-w-2xl">
              <Badge variant="accent">Herramienta</Badge>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-950">
                ¿Cuánto te cuesta una hora de paro?
              </h2>
              <p className="mt-2 text-ink-600">
                Calcúlalo y mira por qué responder en 2 horas — no en 3 días — cambia el resultado.
              </p>
            </div>
            <DowntimeCalculator />
          </div>
        </section>

        {/* ─── PROVEEDORES VERIFICADOS ─── */}
        <section id="proveedores-verificados" className="border-b bg-paper-300 py-12">
          <div className="container">
            <div className="mb-8 max-w-2xl">
              <Badge variant="steel"><ShieldCheck className="size-3" /> Compra con confianza</Badge>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-950">
                Proveedores verificados, no desconocidos
              </h2>
              <p className="mt-2 text-ink-600">
                Cada proveedor pasa validación de certificaciones y score real (calidad, velocidad,
                comunicación y precio). Tú compras tranquilo; Novak responde.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {proveedores.map((p) => (
                <SupplierScorecard key={p.id} provider={p} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIOS ─── */}
        <section className="border-b py-12">
          <div className="container">
            <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-ink-950">
              Compradores que ya no paran su línea
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {TESTIMONIOS.map((t) => (
                <Card key={t.nombre}>
                  <CardContent className="flex h-full flex-col p-6">
                    <Quote className="size-7 text-safety/40" />
                    <p className="mt-3 flex-1 text-sm text-ink-700">“{t.quote}”</p>
                    <div className="mt-5 flex items-center gap-3 border-t pt-4">
                      <span className="flex size-10 items-center justify-center rounded-full bg-ink-950 font-display text-sm font-bold text-white">
                        {t.ini}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{t.nombre}</p>
                        <p className="text-xs text-ink-500">{t.cargo} · {t.empresa}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BANDA PROVEEDORES ─── */}
        <section className="border-b py-10">
          <div className="container">
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card p-6 text-center sm:flex-row sm:text-left">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-safety">
                  <Store className="size-5" />
                </span>
                <div>
                  <p className="font-display font-semibold text-ink-900">¿Eres proveedor de insumos industriales?</p>
                  <p className="text-sm text-ink-600">Vende a cientos de maquiladoras. Nosotros ponemos el crédito y protegemos tu cobro.</p>
                </div>
              </div>
              <Link href="/vender" className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}>
                Conoce el programa <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ─── */}
        <section className="relative overflow-hidden bg-ink-950 py-16 text-white">
          <div className="absolute inset-0 glow-accent" />
          <div className="container relative flex flex-col items-center gap-5 text-center">
            <h2 className="max-w-3xl font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Tu primera cotización va <span className="text-gold">sin comisión</span>
            </h2>
            <p className="max-w-xl text-ink-300">{content.garantia}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/registro" className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}>
                Crear mi cuenta gratis <ArrowRight className="size-4" />
              </Link>
              <Link href="/productos" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white")}>
                Explorar el catálogo
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-400">
              <span className="flex items-center gap-1.5"><FileText className="size-4" /> CFDI automático</span>
              <span className="flex items-center gap-1.5"><CreditCard className="size-4" /> Crédito 30/60/90</span>
              <span className="flex items-center gap-1.5"><Truck className="size-4" /> Entrega 24–48h</span>
              <a href={BRAND.whatsappLink} className="flex items-center gap-1.5 hover:text-white"><MessageCircle className="size-4" /> WhatsApp</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
