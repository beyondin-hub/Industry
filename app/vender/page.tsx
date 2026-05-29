import Link from "next/link";
import {
  ArrowRight, Banknote, Warehouse, PackageCheck, ShieldCheck, Check,
  Zap, Store, Sparkles, Lock, TrendingUp, Clock, FileText,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { REVENUE_STREAMS, FULFILLMENT_OPTIONS, PROVIDER_MODEL } from "@/lib/pricing/provider";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Vende a las maquiladoras del norte — Proveedores Novak",
  description:
    "Da de alta tu catálogo gratis y vende a cientos de maquiladoras. Sin cuota de entrada ni mensualidad: solo comisión por venta. Novak pone el crédito, el fulfillment y protege tu cobro.",
};

const BENEFICIOS = [
  { icon: Banknote, t: "Nosotros ponemos el crédito", d: "Novak otorga la línea de crédito a la maquiladora y te paga a ti. Tú cobras seguro; nosotros asumimos el riesgo de cobranza." },
  { icon: TrendingUp, t: "Demanda calificada", d: "Recibe RFQs reales de compradores verificados de tu categoría. Sin prospección ni equipo de ventas." },
  { icon: Warehouse, t: "Fulfillment en Tijuana", d: "Opcional: almacenamos tu inventario y preparamos pedidos para entregar en 24-48h." },
  { icon: ShieldCheck, t: "Cobro protegido", d: "Le facturas a Novak, no a la maquila. Nosotros gestionamos cobranza y CFDI. Cero cuentas incobrables." },
];

const PASOS = [
  { n: "01", t: "Date de alta gratis", d: "Registra tu empresa y elige cómo quieres cumplir: fulfillment Tijuana, dropshipping o entrega gestionada." },
  { n: "02", t: "Sube tu catálogo con IA", d: "Importa tu lista, PDF o catálogo existente. Nuestra IA completa y enriquece la ficha de cada producto. Tú solo validas." },
  { n: "03", t: "Recibe RFQs y vende", d: "Cotiza desde tu portal. Novak cobra, financia y entrega. Tú produces y cobras seguro." },
];

export default function VenderPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b bg-ink-950 text-white">
          <div className="absolute inset-0 glow-accent" />
          <div className="absolute inset-0 bg-noise opacity-40" />
          <div className="container relative py-20 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="purplecow" className="mx-auto px-3 py-1 text-sm">
                <Sparkles className="size-3.5" /> Programa de Proveedores Fundadores
              </Badge>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Vende a cientos de maquiladoras —{" "}
                <span className="text-gradient">y nosotros ponemos el crédito</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-ink-300">
                Da de alta tu catálogo gratis. Sin cuota de entrada ni mensualidad:
                solo comisión cuando vendes. Novak te trae la demanda, financia a la
                maquiladora y protege tu cobro.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/vender/registro" className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}>
                  Quiero ser proveedor fundador <ArrowRight className="size-4" />
                </Link>
                <Link href="#modelo" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white")}>
                  Ver cómo ganamos juntos
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-400">
                <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-400" /> $0 de alta</span>
                <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-400" /> $0 mensualidad</span>
                <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-400" /> Hasta {PROVIDER_MODEL.skusGratis} SKUs gratis</span>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFICIOS */}
        <section className="border-b py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950">
                Lo que ganas al darte de alta en Novak
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFICIOS.map((b) => (
                <Card key={b.t} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-ink-950 text-safety">
                      <b.icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-semibold text-ink-900">{b.t}</h3>
                    <p className="mt-1.5 text-sm text-ink-600">{b.d}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="border-b bg-paper-300 py-16">
          <div className="container">
            <h2 className="mb-12 font-display text-3xl font-bold tracking-tight text-ink-950">Empieza en minutos</h2>
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

        {/* FULFILLMENT */}
        <section className="border-b py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <Badge variant="steel"><Warehouse className="size-3" /> Cumplimiento flexible</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">
                Tú eliges cómo entregar
              </h2>
              <p className="mt-2 text-ink-600">Desde 100% gestionado por Novak hasta conservar tu inventario.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {FULFILLMENT_OPTIONS.map((f) => (
                <Card key={f.id}>
                  <CardContent className="p-6">
                    <PackageCheck className="size-7 text-safety" />
                    <h3 className="mt-3 font-semibold text-ink-900">{f.nombre}</h3>
                    <p className="mt-1.5 text-sm text-ink-600">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* MODELO / PRICING */}
        <section id="modelo" className="border-b bg-paper-300 py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <Badge variant="success">Transparencia total</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">
                Cómo ganamos juntos
              </h2>
              <p className="mt-2 text-ink-600">
                Solo cobramos comisión cuando tú vendes. Lo demás son servicios
                opcionales que activas si te convienen — Novak gana cuando tú ganas más.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REVENUE_STREAMS.map((r) => (
                <div key={r.id} className={cn("rounded-xl border p-5", r.opcional ? "bg-card" : "border-safety/40 bg-safety-50/50")}>
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-ink-950 text-safety">
                      <r.icon className="size-4" />
                    </span>
                    <span className="font-display text-lg font-extrabold text-ink-950">{r.valor}</span>
                  </div>
                  <h3 className="mt-3 flex items-center gap-2 font-semibold text-ink-900">
                    {r.nombre}
                    {!r.opcional && <Badge variant="accent" className="text-[10px]">base</Badge>}
                    {r.opcional && <Badge variant="secondary" className="text-[10px]">opcional</Badge>}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-600">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROTECCIÓN / ANTI-BYPASS (enmarcado como beneficio) */}
        <section className="border-b py-16">
          <div className="container grid items-center gap-10 md:grid-cols-2">
            <div>
              <Badge variant="steel"><Lock className="size-3" /> Relación protegida</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">
                Vendes sin riesgo y sin pelear cuentas por cobrar
              </h2>
              <p className="mt-3 text-ink-600">
                Novak es tu cliente: te compra, te paga y se encarga del crédito, la
                cobranza y el CFDI con la maquiladora. Tú te enfocas en surtir bien y a tiempo.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-ink-700">
                <li className="flex gap-2"><ShieldCheck className="size-5 shrink-0 text-emerald-600" /> Le facturas a Novak — cero cuentas incobrables con la planta.</li>
                <li className="flex gap-2"><ShieldCheck className="size-5 shrink-0 text-emerald-600" /> Novak asume el riesgo de crédito de la maquiladora.</li>
                <li className="flex gap-2"><ShieldCheck className="size-5 shrink-0 text-emerald-600" /> Pagos puntuales según tus condiciones pactadas.</li>
              </ul>
            </div>
            <Card className="bg-ink-950 text-white">
              <CardContent className="space-y-4 p-6">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink-200">
                  <FileText className="size-4 text-safety" /> Ejemplo de una venta
                </p>
                <div className="space-y-2 text-sm">
                  {[
                    ["La maquila pide y Novak aprueba el crédito", "✓"],
                    ["Tú cotizas y surtes (o lo hacemos por fulfillment)", "✓"],
                    ["Novak te paga a ti según lo pactado", "✓"],
                    ["Novak cobra a la maquila y emite el CFDI", "✓"],
                  ].map(([t, c]) => (
                    <div key={t} className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-ink-300">{t}</span>
                      <span className="font-mono text-emerald-400">{c}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ink-400">
                  La identidad y los datos de la maquiladora se mantienen protegidos en la
                  plataforma. Novak cuida la relación de ambos lados.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FUNDADORES CTA */}
        <section className="relative overflow-hidden bg-ink-950 py-20 text-white">
          <div className="absolute inset-0 glow-accent" />
          <div className="container relative flex flex-col items-center gap-5 text-center">
            <Badge variant="purplecow"><Zap className="size-3.5" /> Cupos limitados de fundadores</Badge>
            <h2 className="max-w-3xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Sé de los primeros proveedores de Novak
            </h2>
            <p className="max-w-xl text-ink-300">
              Los proveedores fundadores tienen prioridad en RFQs, comisión preferente y
              acompañamiento 1 a 1 para subir su catálogo. Sin costo de entrada.
            </p>
            <Link href="/vender/registro" className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}>
              <Store className="size-4" /> Crear mi cuenta de proveedor
            </Link>
            <p className="flex items-center gap-1.5 text-sm text-ink-400">
              <Clock className="size-4" /> El alta toma menos de 10 minutos
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
