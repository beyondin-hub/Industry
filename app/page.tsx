import Link from "next/link";
import {
  Search,
  Clock,
  Truck,
  CreditCard,
  ShieldCheck,
  FileText,
  MessageCircle,
  ScanBarcode,
  FileSpreadsheet,
  BadgeCheck,
  Repeat,
  BarChart3,
  Users,
  Check,
  X,
  ArrowRight,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIAS, BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

const VALUE_PROPS = [
  {
    icon: Clock,
    title: "Cotización en menos de 2 horas",
    desc: "Garantía Purple Cow: si no cotizamos en 2h hábiles, tu siguiente orden va con 0% de comisión.",
    color: "text-purplecow",
  },
  {
    icon: Truck,
    title: "Entrega 24–48h",
    desc: "Top 200 SKUs con stock propio confirmado en Tijuana, Mexicali, Juárez y Monterrey.",
    color: "text-safety",
  },
  {
    icon: CreditCard,
    title: "Crédito B2B en 24h",
    desc: "Línea preaprobada a 30, 60 o 90 días vía nuestro partner SOFOM. Aprobación exprés.",
    color: "text-emerald-600",
  },
  {
    icon: ShieldCheck,
    title: "Proveedores certificados",
    desc: "100% verificados: ISO 9001, IATF 16949, ISO 13485 y NOM vigentes. Sin sorpresas.",
    color: "text-steel-600",
  },
];

const FEATURES = [
  { icon: FileSpreadsheet, t: "RFQ inteligente", d: "Un formulario, múltiples proveedores cotizan. Sube foto si no tienes el número de parte." },
  { icon: ScanBarcode, t: "Quick Order por SKU", d: "Pega tu número de parte o escanea el código de barras y agrégalo al carrito al instante." },
  { icon: Repeat, t: "Reorden automático", d: "Programa insumos recurrentes con 5% de descuento. Estilo Subscribe & Save industrial." },
  { icon: BarChart3, t: "Spend analytics", d: "Gasto por categoría, mes y usuario. Inteligencia para negociar mejor cada trimestre." },
  { icon: Users, t: "Multi-usuario + aprobaciones", d: "Roles de comprador, autorizador y admin. Flujos de aprobación por monto." },
  { icon: FileText, t: "CFDI automático", d: "Factura fiscal válida emitida automáticamente en cada transacción." },
];

const PASOS = [
  { n: "01", t: "Solicita", d: "Sube tu lista, pega números de parte o describe lo que necesitas — incluso con una foto del componente." },
  { n: "02", t: "Recibe cotización", d: "Nuestra mesa de operaciones consigue precios de proveedores certificados en menos de 2 horas hábiles." },
  { n: "03", t: "Aprueba y recibe", d: "Confirma con un clic, paga de contado o a crédito, y recibe en planta en 24–48h con CFDI incluido." },
];

const COMPARATIVA = [
  { feature: "Cotización en 2h garantizada", mrolink: true, grainger: false, local: false, amazon: false },
  { feature: "WhatsApp-first en español", mrolink: true, grainger: false, local: true, amazon: false },
  { feature: "Stock garantizado en norte MX", mrolink: true, grainger: false, local: false, amazon: false },
  { feature: "Crédito B2B en MXN a 30-90 días", mrolink: true, grainger: false, local: false, amazon: true },
  { feature: "CFDI automático", mrolink: true, grainger: false, local: true, amazon: false },
  { feature: "Proveedores certificados IATF/ISO", mrolink: true, grainger: true, local: false, amazon: false },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-white to-steel-50">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="container relative grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
            <div className="animate-fade-in space-y-7">
              <Badge variant="purplecow" className="px-3 py-1 text-sm">
                <Zap className="size-3.5" /> Garantía 2 horas o 0% comisión
              </Badge>
              <h1 className="text-4xl font-extrabold tracking-tight text-steel-950 text-balance sm:text-5xl lg:text-6xl">
                Que ninguna línea pare por un{" "}
                <span className="text-safety">problema de suministro</span>.
              </h1>
              <p className="max-w-xl text-lg text-steel-600">
                MROLink es tu equipo de compras externo para la industria
                maquiladora. Cotiza, compra y recibe insumos MRO de proveedores
                certificados — todo desde un solo lugar, en horas, no en días.
              </p>

              {/* Quick search (McMaster-style instant entry) */}
              <form
                action="/catalogo"
                className="flex w-full max-w-xl items-center gap-2 rounded-xl border bg-white p-2 shadow-sm"
              >
                <Search className="ml-2 size-5 shrink-0 text-steel-400" />
                <input
                  name="q"
                  placeholder="Busca por número de parte, marca o descripción…"
                  className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-steel-400"
                  aria-label="Buscar producto"
                />
                <Button type="submit" variant="accent">
                  Buscar
                </Button>
              </form>

              <div className="flex flex-wrap items-center gap-4 text-sm text-steel-600">
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-600" /> Ver precios sin
                  registrarte
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-600" /> 6,000+
                  maquiladoras
                </span>
                <a
                  href={BRAND.whatsappLink}
                  className="flex items-center gap-1.5 font-semibold text-emerald-700 hover:underline"
                >
                  <MessageCircle className="size-4" /> Cotiza por WhatsApp
                </a>
              </div>
            </div>

            {/* Live availability card */}
            <div className="animate-fade-in lg:pl-8">
              <Card className="overflow-hidden border-steel-200 shadow-xl">
                <div className="flex items-center justify-between bg-steel-900 px-5 py-3 text-white">
                  <span className="text-sm font-semibold">Disponibilidad en vivo</span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-300">
                    <span className="size-2 animate-pulse-dot rounded-full bg-emerald-400" />
                    Stock confirmado
                  </span>
                </div>
                <CardContent className="divide-y p-0">
                  {[
                    { p: "Balero 6205-2RS · SKF", c: "Tijuana", t: "Entrega mañana", s: "340 en stock" },
                    { p: "Guante nitrilo T9 · Ansell", c: "Tijuana", t: "Entrega mañana", s: "2,400 en stock" },
                    { p: "Grasa EP2 400g · Mobil", c: "Mexicali", t: "Entrega 24h", s: "640 en stock" },
                    { p: "Cilindro Festo Ø32x100", c: "Monterrey", t: "Entrega 24-48h", s: "44 en stock" },
                  ].map((row) => (
                    <div key={row.p} className="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-steel-900">{row.p}</p>
                        <p className="text-xs text-steel-500">📍 {row.c} · {row.s}</p>
                      </div>
                      <Badge variant="success" className="shrink-0">
                        <Truck className="size-3" /> {row.t}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* VALUE PROPS */}
        <section className="border-b bg-white py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-steel-950">
                Por qué los compradores eligen MROLink
              </h2>
              <p className="mt-2 text-steel-600">
                Resolvemos los 4 dolores reales del jefe de compras de una maquiladora.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUE_PROPS.map((v) => (
                <Card key={v.title} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <v.icon className={cn("mb-4 size-9", v.color)} />
                    <h3 className="mb-1.5 font-semibold text-steel-900">{v.title}</h3>
                    <p className="text-sm text-steel-600">{v.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORÍAS */}
        <section id="categorias" className="border-b bg-steel-50 py-16">
          <div className="container">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-steel-950">
                  Catálogo MRO por categoría
                </h2>
                <p className="mt-2 text-steel-600">
                  Taxonomía industrial profunda — busca por uso, no solo por nombre.
                </p>
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
                  className="group rounded-xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-safety hover:shadow-md"
                >
                  <div className="mb-3 text-3xl">{c.emoji}</div>
                  <h3 className="text-sm font-semibold text-steel-900 group-hover:text-safety">
                    {c.nombre}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-steel-500">{c.descripcion}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES (benchmark) */}
        <section className="border-b bg-white py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <Badge variant="steel" className="mb-3">Inspirado en los mejores B2B del mundo</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-steel-950">
                Las herramientas de Grainger, Amazon Business y Alibaba — para México
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.t} className="flex gap-4 rounded-xl border bg-steel-50/60 p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-steel-900 text-safety">
                    <f.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-steel-900">{f.t}</h3>
                    <p className="mt-1 text-sm text-steel-600">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como-funciona" className="border-b bg-steel-950 py-16 text-white">
          <div className="container">
            <h2 className="mb-12 text-3xl font-bold tracking-tight">Cómo funciona</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {PASOS.map((p, i) => (
                <div key={p.n} className="relative">
                  <span className="text-5xl font-extrabold text-safety/30">{p.n}</span>
                  <h3 className="mt-2 text-xl font-semibold">{p.t}</h3>
                  <p className="mt-2 text-steel-400">{p.d}</p>
                  {i < PASOS.length - 1 && (
                    <ArrowRight className="absolute -right-4 top-8 hidden size-6 text-steel-700 md:block" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap gap-3">
              <Link href="/cotizar" className={cn(buttonVariants({ variant: "accent", size: "lg" }))}>
                Solicitar cotización
              </Link>
              <a
                href={BRAND.whatsappLink}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white")}
              >
                <MessageCircle className="size-4" /> Hablar por WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* COMPARATIVA */}
        <section className="border-b bg-white py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-steel-950">
                MROLink vs. las alternativas
              </h2>
              <p className="mt-2 text-steel-600">
                Lo que nadie más combina para la maquiladora del norte de México.
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b bg-steel-50 text-left">
                    <th className="px-4 py-3 font-semibold text-steel-700">Capacidad</th>
                    <th className="px-4 py-3 text-center font-bold text-safety">MROLink</th>
                    <th className="px-4 py-3 text-center font-medium text-steel-500">Grainger / MSC</th>
                    <th className="px-4 py-3 text-center font-medium text-steel-500">Distribuidor local</th>
                    <th className="px-4 py-3 text-center font-medium text-steel-500">Amazon Business</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIVA.map((row) => (
                    <tr key={row.feature} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium text-steel-800">{row.feature}</td>
                      <Cell ok={row.mrolink} highlight />
                      <Cell ok={row.grainger} />
                      <Cell ok={row.local} />
                      <Cell ok={row.amazon} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* PURPLE COW GUARANTEE */}
        <section className="bg-gradient-to-r from-purplecow-600 to-purplecow py-14 text-white">
          <div className="container flex flex-col items-center gap-4 text-center">
            <Badge className="bg-white/15 text-white">Nuestra Garantía</Badge>
            <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              “{BRAND.garantia}”
            </h2>
            <p className="max-w-xl text-purplecow-100">
              Porque sabemos lo que cuesta un paro de línea. Asumimos el riesgo contigo.
            </p>
          </div>
        </section>

        {/* PROVEEDORES CTA */}
        <section id="proveedores" className="bg-white py-16">
          <div className="container grid items-center gap-10 rounded-2xl border bg-steel-50 p-8 md:grid-cols-2 md:p-12">
            <div>
              <Badge variant="accent" className="mb-3">Para proveedores</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-steel-950">
                Vende a cientos de maquiladoras sin equipo de ventas
              </h2>
              <p className="mt-3 text-steel-600">
                Recibe RFQs calificadas, cotiza desde tu portal y deja que MROLink
                cobre, facture y entregue. Tú produces, nosotros conectamos.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-steel-700">
                <li className="flex gap-2"><BadgeCheck className="size-5 text-emerald-600" /> Demanda calificada de compradores reales</li>
                <li className="flex gap-2"><BadgeCheck className="size-5 text-emerald-600" /> Badge de proveedor certificado y verificado</li>
                <li className="flex gap-2"><BadgeCheck className="size-5 text-emerald-600" /> Membresías desde $2,500 MXN/mes</li>
              </ul>
              <div className="mt-6">
                <Link href="/registro" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
                  Convertirme en proveedor
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { k: "GMV mensual", v: "$8.4B", s: "mercado MRO MX" },
                { k: "Maquiladoras", v: "6,000+", s: "activas" },
                { k: "Cobertura", v: "4", s: "ciudades clave" },
                { k: "Cotización", v: "<2h", s: "garantizada" },
                { k: "Entrega", v: "24-48h", s: "top SKUs" },
                { k: "Crédito", v: "90d", s: "B2B MXN" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border bg-white p-4 text-center">
                  <p className="text-2xl font-extrabold text-steel-900">{s.v}</p>
                  <p className="text-xs font-medium text-safety">{s.k}</p>
                  <p className="text-[11px] text-steel-500">{s.s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Cell({ ok, highlight }: { ok: boolean; highlight?: boolean }) {
  return (
    <td className={cn("px-4 py-3 text-center", highlight && "bg-safety-50")}>
      {ok ? (
        <Check className="mx-auto size-5 text-emerald-600" />
      ) : (
        <X className="mx-auto size-5 text-steel-300" />
      )}
    </td>
  );
}
