import Link from "next/link";
import {
  Search,
  Clock,
  Truck,
  CreditCard,
  ShieldCheck,
  FileText,
  MessageCircle,
  ArrowRight,
  Zap,
  Timer,
  PackageX,
  HandCoins,
  Quote,
  Check,
  Crown,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { DowntimeCalculator } from "@/components/marketing/downtime-calculator";
import { SupplierScorecard } from "@/components/shared/supplier-scorecard";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIAS, BRAND } from "@/lib/constants";
import { PROVIDERS } from "@/lib/data/providers";
import { cn } from "@/lib/utils";

const MARCAS = ["SKF", "SMC", "FESTO", "3M", "MOBIL", "SIEMENS", "BOSCH", "PARKER", "MITUTOYO", "SCHNEIDER", "NSK", "GATES"];

const PROBLEMAS = [
  { icon: Timer, t: "3–5 días por una cotización", d: "Mientras tu línea espera, mandas correos y haces llamadas a 4 distribuidores sin respuesta clara." },
  { icon: PackageX, t: "Sin stock confirmado", d: "Te prometen disponibilidad y al final no hay pieza. La línea sigue parada y nadie responde." },
  { icon: HandCoins, t: "Sin crédito ágil", d: "El distribuidor local no da crédito y compras tienen que aprobar la orden. Más demora." },
];

const PILARES = [
  { icon: Clock, t: "Cotización en 2 horas", d: "Garantía o tu siguiente orden con 0% comisión.", color: "text-purplecow" },
  { icon: Truck, t: "Entrega 24–48h", d: "Top 200 SKUs con stock propio confirmado.", color: "text-safety" },
  { icon: CreditCard, t: "Crédito B2B en 24h", d: "Línea preaprobada 30/60/90 días vía SOFOM.", color: "text-emerald-700" },
  { icon: ShieldCheck, t: "100% certificados", d: "ISO 9001, IATF 16949, ISO 13485 y NOM.", color: "text-info" },
];

const PASOS = [
  { n: "01", t: "Solicita", d: "Pega números de parte, sube tu lista o describe el problema — incluso con una foto del componente." },
  { n: "02", t: "Cotizamos", d: "Nuestra mesa de operaciones consigue precios de proveedores certificados en menos de 2 horas." },
  { n: "03", t: "Recibes", d: "Aprueba con un clic, paga de contado o a crédito y recibe en planta en 24–48h con CFDI." },
];

const TESTIMONIOS = [
  { quote: "Pasamos de esperar 3 días por cotización a tenerla antes de comer. Una válvula a tiempo evitó parar la línea de ensamble.", nombre: "Jorge Medina", cargo: "Gerente de Compras", empresa: "Proveedor automotriz Tier 1, Tijuana", ini: "JM" },
  { quote: "El crédito a 60 días nos cambió el flujo. Y todo llega con CFDI, sin perseguir facturas con cada distribuidor.", nombre: "Daniela Ruiz", cargo: "Jefa de Abastecimiento", empresa: "Electrónica, Mexicali", ini: "DR" },
  { quote: "El reorden automático de EPP y lubricantes nos quitó trabajo manual. Nunca más nos quedamos sin guantes a media producción.", nombre: "Carlos Esquivel", cargo: "Jefe de Mantenimiento", empresa: "Manufactura, Cd. Juárez", ini: "CE" },
];

const PLANES = [
  { plan: "Básico", precio: "$2,500", destacado: false, features: ["Hasta 50 productos", "RFQ ilimitados", "Perfil verificado"] },
  { plan: "Premium", precio: "$5,000", destacado: true, features: ["Hasta 300 productos", "Badge destacado", "Prioridad en RFQ", "Analytics de demanda"] },
  { plan: "Enterprise", precio: "$8,000", destacado: false, features: ["Productos ilimitados", "API e integración", "Account manager", "Inteligencia de mercado"] },
];

export default function LandingPage() {
  const proveedores = PROVIDERS.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="absolute inset-0 gradient-accent-soft" />
          <div className="container relative py-20 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="purplecow" className="mx-auto px-3 py-1 text-sm">
                <Zap className="size-3.5" /> Garantía: cotización en 2h o 0% comisión
              </Badge>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-950 text-balance sm:text-5xl lg:text-6xl">
                El equipo de compras externo que la{" "}
                <span className="text-gradient">maquiladora necesitaba</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-ink-600">
                Cotiza, compra y recibe insumos MRO de proveedores certificados —
                en horas, no en días. Un solo WhatsApp y plataforma para todo.
              </p>

              {/* Quick Order Box */}
              <form
                action="/catalogo"
                className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-2 rounded-2xl border bg-card p-2 shadow-lg sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 items-center gap-2 pl-2">
                  <Search className="size-5 shrink-0 text-ink-400" />
                  <input
                    name="q"
                    placeholder="Pega número de parte o describe lo que necesitas…"
                    className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
                    aria-label="Buscar producto"
                  />
                </div>
                <button type="submit" className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}>
                  Cotizar en 2h <ArrowRight className="size-4" />
                </button>
              </form>
              <p className="mt-2 text-xs text-ink-500">
                Respuesta garantizada o tu siguiente compra sin comisión · Sin registro para ver precios
              </p>

              {/* Métricas */}
              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4">
                {[
                  { v: "$8.4B", s: "mercado MRO México" },
                  { v: "6,000+", s: "maquiladoras activas" },
                  { v: "<2h", s: "cotización garantizada" },
                ].map((m) => (
                  <div key={m.s}>
                    <p className="font-display text-3xl font-extrabold text-ink-950">{m.v}</p>
                    <p className="text-xs text-ink-500">{m.s}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/cotizar" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
                  Solicitar cotización
                </Link>
                <Link href="/catalogo" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                  Ver catálogo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TRUST BAR ─── */}
        <section className="border-b bg-card py-8">
          <div className="container">
            <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-ink-400">
              Distribuimos marcas líderes · Proveedores certificados · CFDI garantizado · Crédito B2B · Entrega 24–48h
            </p>
            <div className="relative overflow-hidden">
              <div className="flex w-max animate-marquee items-center gap-12">
                {[...MARCAS, ...MARCAS].map((m, i) => (
                  <span key={i} className="font-display text-xl font-bold text-ink-300">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── EL PROBLEMA ─── */}
        <section className="border-b py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <Badge variant="danger">El problema</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">
                Un paro de línea no espera a tu proveedor
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {PROBLEMAS.map((p) => (
                <Card key={p.t} className="border-danger/15">
                  <CardContent className="p-6">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-danger/10 text-danger">
                      <p.icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-semibold text-ink-900">{p.t}</h3>
                    <p className="mt-1.5 text-sm text-ink-600">{p.d}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── LA SOLUCIÓN ─── */}
        <section className="border-b bg-paper-300 py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <Badge variant="success">La solución</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">
                Cuatro promesas que cambian tu operación
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PILARES.map((v) => (
                <Card key={v.t} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <v.icon className={cn("mb-4 size-9", v.color)} />
                    <h3 className="mb-1.5 font-semibold text-ink-900">{v.t}</h3>
                    <p className="text-sm text-ink-600">{v.d}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CÓMO FUNCIONA ─── */}
        <section id="como-funciona" className="border-b py-16">
          <div className="container">
            <h2 className="mb-12 font-display text-3xl font-bold tracking-tight text-ink-950">
              Cómo funciona
            </h2>
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

        {/* ─── CATEGORÍAS ─── */}
        <section id="categorias" className="border-b bg-paper-300 py-16">
          <div className="container">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950">
                  Catálogo MRO por categoría
                </h2>
                <p className="mt-2 text-ink-600">Taxonomía industrial profunda — busca por uso, no solo por nombre.</p>
              </div>
              <Link href="/catalogo" className={cn(buttonVariants({ variant: "outline" }))}>
                Ver catálogo completo <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {CATEGORIAS.map((c) => (
                <Link
                  key={c.slug}
                  href={`/catalogo?categoria=${c.slug}`}
                  className="group rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-safety hover:shadow-md"
                >
                  <div className="mb-3 text-3xl">{c.emoji}</div>
                  <h3 className="text-sm font-semibold text-ink-900 group-hover:text-safety">{c.nombre}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-500">{c.descripcion}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── QUICK ORDER DARK ─── */}
        <section className="relative overflow-hidden bg-ink-950 py-16 text-white">
          <div className="absolute inset-0 glow-accent" />
          <div className="absolute inset-0 bg-noise opacity-50" />
          <div className="container relative">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                ¿Sabes el número de parte?{" "}
                <span className="text-gradient">Ordena en 60 segundos</span>
              </h2>
              <p className="mt-3 text-ink-300">
                Pega tu SKU, confirmamos stock y precio al instante. Si no lo tenemos en catálogo,
                nuestro equipo lo busca y cotiza en 2 horas.
              </p>
              <form
                action="/catalogo"
                className="mx-auto mt-7 flex w-full max-w-xl flex-col gap-2 rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 backdrop-blur sm:flex-row"
              >
                <input
                  name="q"
                  placeholder="Ej. 6205-2RS, CIL-32-100, SEN-IND-M18…"
                  className="h-11 flex-1 rounded-lg bg-transparent px-3 font-mono text-sm text-white outline-none placeholder:text-ink-400"
                />
                <button type="submit" className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}>
                  Buscar y cotizar
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ─── CALCULADORA DE PARO ─── */}
        <section className="border-b py-16">
          <div className="container">
            <div className="mb-8 max-w-2xl">
              <Badge variant="accent">Herramienta</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">
                ¿Cuánto te cuesta una hora de paro?
              </h2>
              <p className="mt-2 text-ink-600">
                Calcúlalo y mira por qué responder en 2 horas — no en 3 días — cambia el resultado.
              </p>
            </div>
            <DowntimeCalculator />
          </div>
        </section>

        {/* ─── TESTIMONIALES ─── */}
        <section className="border-b bg-paper-300 py-16">
          <div className="container">
            <h2 className="mb-10 font-display text-3xl font-bold tracking-tight text-ink-950">
              Compradores de maquiladora que ya no paran su línea
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

        {/* ─── PROVEEDORES VERIFICADOS ─── */}
        <section id="proveedores-verificados" className="border-b py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <Badge variant="steel"><ShieldCheck className="size-3" /> Trade Assurance</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">
                Proveedores verificados, con score real
              </h2>
              <p className="mt-2 text-ink-600">
                Cada proveedor pasa validación de certificaciones y se califica por calidad, velocidad, comunicación y precio.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {proveedores.map((p) => (
                <SupplierScorecard key={p.id} provider={p} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── PRICING PROVEEDORES ─── */}
        <section id="proveedores" className="border-b bg-paper-300 py-16">
          <div className="container">
            <div className="mb-10 text-center">
              <Badge variant="accent">Para proveedores</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">
                Vende a cientos de maquiladoras sin equipo de ventas
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-ink-600">
                Recibe RFQs calificadas y deja que Novak cobre, facture y entregue.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {PLANES.map((pl) => (
                <Card key={pl.plan} className={cn(pl.destacado && "border-safety ring-2 ring-safety/30")}>
                  <CardContent className="p-6">
                    {pl.destacado && (
                      <Badge variant="accent" className="mb-3"><Crown className="size-3" /> Más popular</Badge>
                    )}
                    <h3 className="font-display text-lg font-bold text-ink-900">{pl.plan}</h3>
                    <p className="mt-1">
                      <span className="font-display text-3xl font-extrabold text-ink-950">{pl.precio}</span>
                      <span className="text-sm text-ink-500"> MXN/mes</span>
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-ink-700">
                      {pl.features.map((f) => (
                        <li key={f} className="flex gap-2">
                          <Check className="size-4 shrink-0 text-emerald-700" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/registro"
                      className={cn(
                        buttonVariants({ variant: pl.destacado ? "gradient" : "outline" }),
                        "mt-6 w-full",
                      )}
                    >
                      Empezar
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ─── */}
        <section className="relative overflow-hidden bg-ink-950 py-20 text-white">
          <div className="absolute inset-0 glow-accent" />
          <div className="container relative flex flex-col items-center gap-5 text-center">
            <h2 className="max-w-3xl font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Tu primera cotización va{" "}
              <span className="text-gradient">sin comisión</span>
            </h2>
            <p className="max-w-xl text-ink-300">{BRAND.garantia}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/registro" className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}>
                Regístrate gratis <ArrowRight className="size-4" />
              </Link>
              <a
                href={BRAND.whatsappLink}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white")}
              >
                <MessageCircle className="size-4" /> Hablar por WhatsApp
              </a>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-400">
              <span className="flex items-center gap-1.5"><FileText className="size-4" /> CFDI automático</span>
              <span className="flex items-center gap-1.5"><CreditCard className="size-4" /> Crédito 30/60/90</span>
              <span className="flex items-center gap-1.5"><Truck className="size-4" /> Entrega 24–48h</span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
