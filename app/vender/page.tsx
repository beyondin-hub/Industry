import Link from "next/link";
import {
  ArrowRight, Banknote, Warehouse, PackageCheck, ShieldCheck, Check, X,
  Zap, Store, Sparkles, Lock, TrendingUp, Clock, FileText, Bot, MessagesSquare,
  BarChart3, ClipboardCheck, Truck, Layers,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { FAQ } from "@/components/marketing/faq";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { REVENUE_STREAMS, FULFILLMENT_OPTIONS, PROVIDER_MODEL } from "@/lib/pricing/provider";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Vende en Novak — Aplica como proveedor",
  description:
    "Aplica para vender a cientos de maquiladoras del norte de México. Sin cuota de entrada ni mensualidad. Novak pone el crédito, protege tu cobro y te trae la demanda. Cuenta por aprobación.",
};

const VALOR = [
  { icon: Banknote, t: "Nosotros ponemos el crédito", d: "Novak financia a la maquiladora y te paga a ti. Cero riesgo de cobranza para tu negocio." },
  { icon: TrendingUp, t: "Demanda calificada", d: "RFQs reales de compradores verificados de tu categoría. Sin prospección ni equipo de ventas." },
  { icon: Warehouse, t: "Fulfillment en Tijuana", d: "Opcional: almacenamos tu inventario y entregamos en 24-48h por ti." },
  { icon: ShieldCheck, t: "Cobro protegido", d: "Le facturas a Novak. Te pagamos según lo pactado, aunque la maquila pague a 90 días." },
];

const FEATURES = [
  { icon: Store, t: "Tu portal de proveedor", d: "Panel propio para gestionar catálogo, cotizaciones, mensajes y pagos." },
  { icon: ClipboardCheck, t: "RFQs calificados", d: "Recibe solicitudes de cotización segmentadas a tus categorías y certificaciones." },
  { icon: Bot, t: "Carga de catálogo con IA", d: "Sube tu lista, PDF o catálogo y la IA completa la ficha de cada producto. Tú validas." },
  { icon: MessagesSquare, t: "Mensajería mediada", d: "Comunícate por la plataforma con datos de contacto protegidos." },
  { icon: Truck, t: "Cumplimiento flexible", d: "Fulfillment Tijuana, dropshipping o entrega gestionada por Novak." },
  { icon: BarChart3, t: "Métricas y pagos", d: "Ventas, desempeño y dispersión de pagos a tu CLABE, en un solo lugar." },
];

const VENTAJAS = [
  { f: "Acceso a cientos de maquiladoras", novak: true, solo: false },
  { f: "Crédito a la maquila sin que tú lo financies", novak: true, solo: false },
  { f: "Cobro protegido (le facturas a Novak)", novak: true, solo: false },
  { f: "Carga de catálogo asistida por IA", novak: true, solo: false },
  { f: "Logística y fulfillment opcional", novak: true, solo: false },
  { f: "Sin equipo de ventas ni prospección", novak: true, solo: false },
];

const BENEFICIOS = [
  "Cobras seguro y a tiempo, sin cuentas incobrables.",
  "Vendes más sin contratar vendedores.",
  "Entregas más rápido con fulfillment en Tijuana.",
  "Creces con demanda recurrente y reorden automático.",
];

const PROCESO = [
  { n: "01", t: "Aplica", d: "Crea tu cuenta y completa tu solicitud en menos de 10 minutos.", icon: ClipboardCheck },
  { n: "02", t: "Te revisamos", d: "Validamos tus datos fiscales y certificaciones (24–48h hábiles). Novak es selectivo.", icon: ShieldCheck },
  { n: "03", t: "Subes tu catálogo", d: "Con ayuda de la IA, en minutos. Tú validas y publicas.", icon: Bot },
  { n: "04", t: "Empiezas a vender", d: "Al ser aprobado, activamos tu catálogo y recibes RFQs.", icon: Store },
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
                <Sparkles className="size-3.5" /> Programa de Proveedores Fundadores · por aprobación
              </Badge>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Queremos que vendas con nosotros —{" "}
                <span className="text-gradient">y nosotros ponemos el crédito</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-ink-300">
                Novak conecta a proveedores selectos con cientos de maquiladoras del norte.
                Crea tu cuenta, explora la plataforma y envía tu solicitud — aprobamos a un
                grupo limitado de proveedores fundadores.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/vender/registro" className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}>
                  Aplica para vender en Novak <ArrowRight className="size-4" />
                </Link>
                <Link href="#proceso" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white")}>
                  Cómo es el proceso
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-400">
                <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-400" /> $0 de alta</span>
                <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-400" /> $0 mensualidad</span>
                <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-400" /> Hasta {PROVIDER_MODEL.skusGratis} SKUs gratis</span>
                <span className="flex items-center gap-1.5"><Lock className="size-4 text-safety" /> Cuenta por aprobación</span>
              </div>
            </div>
          </div>
        </section>

        {/* OFERTA DE VALOR */}
        <section className="border-b py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950">Por qué vender en Novak</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALOR.map((b) => (
                <Card key={b.t} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-ink-950 text-safety"><b.icon className="size-5" /></span>
                    <h3 className="mt-4 font-semibold text-ink-900">{b.t}</h3>
                    <p className="mt-1.5 text-sm text-ink-600">{b.d}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* LA PLATAFORMA */}
        <section className="border-b bg-paper-300 py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <Badge variant="steel">La plataforma</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">Todo lo que tendrás dentro</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.t} className="flex gap-4 rounded-xl border bg-card p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-ink-950 text-safety"><f.icon className="size-5" /></div>
                  <div>
                    <h3 className="font-semibold text-ink-900">{f.t}</h3>
                    <p className="mt-1 text-sm text-ink-600">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VENTAJAS vs VENDER SOLO */}
        <section className="border-b py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950">Con Novak vs. vender por tu cuenta</h2>
            </div>
            <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-ink-700">Ventaja</th>
                    <th className="px-4 py-3 text-center font-bold text-safety">Con Novak</th>
                    <th className="px-4 py-3 text-center font-medium text-ink-500">Vender solo</th>
                  </tr>
                </thead>
                <tbody>
                  {VENTAJAS.map((v) => (
                    <tr key={v.f} className="border-b last:border-0">
                      <td className="px-4 py-3 text-ink-800">{v.f}</td>
                      <td className="px-4 py-3 text-center"><Check className="mx-auto size-5 text-emerald-600" /></td>
                      <td className="px-4 py-3 text-center"><X className="mx-auto size-5 text-ink-300" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* BENEFICIOS FINALES */}
        <section className="border-b bg-ink-950 py-16 text-white">
          <div className="container grid items-center gap-10 md:grid-cols-2">
            <div>
              <Badge variant="purplecow">El resultado</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Lo que ganas al final</h2>
              <ul className="mt-5 space-y-3">
                {BENEFICIOS.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-ink-200">
                    <Check className="mt-0.5 size-5 shrink-0 text-emerald-400" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-ink-900/60 text-white ring-1 ring-white/10">
              <CardContent className="space-y-4 p-6">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink-200"><FileText className="size-4 text-safety" /> Cómo fluye una venta</p>
                {[
                  "La maquila pide y Novak aprueba el crédito",
                  "Tú cotizas y surtes (o lo hace el fulfillment)",
                  "Novak te paga a ti según lo pactado",
                  "Novak cobra y factura a la maquila",
                ].map((t) => (
                  <div key={t} className="flex items-center justify-between gap-3 border-b border-white/10 pb-2 text-sm">
                    <span className="text-ink-300">{t}</span>
                    <Check className="size-4 shrink-0 text-emerald-400" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* PROCESO DE APROBACIÓN */}
        <section id="proceso" className="border-b py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <Badge variant="accent"><Lock className="size-3" /> Selectivo · por aprobación</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">Cómo es el proceso</h2>
              <p className="mt-2 text-ink-600">
                No cualquiera vende en Novak. Aplicas, te revisamos y, al aprobarte, activamos tu cuenta.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-4">
              {PROCESO.map((p, i) => (
                <div key={p.n} className="relative">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-ink-950 text-safety"><p.icon className="size-5" /></span>
                  <span className="mt-3 block font-display text-xs font-bold text-safety">{p.n}</span>
                  <h3 className="font-display text-lg font-semibold text-ink-900">{p.t}</h3>
                  <p className="mt-1 text-sm text-ink-600">{p.d}</p>
                  {i < PROCESO.length - 1 && <ArrowRight className="absolute -right-3 top-3 hidden size-5 text-ink-300 md:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MODELO */}
        <section className="border-b bg-paper-300 py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <Badge variant="success">Transparencia total</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">Cómo ganamos juntos</h2>
              <p className="mt-2 text-ink-600">Solo cobramos cuando tú vendes. Lo demás es opcional.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REVENUE_STREAMS.map((r) => (
                <div key={r.id} className={cn("rounded-xl border p-5", r.opcional ? "bg-card" : "border-safety/40 bg-safety-50/50")}>
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-ink-950 text-safety"><r.icon className="size-4" /></span>
                    <span className="font-display text-lg font-extrabold text-ink-950">{r.valor}</span>
                  </div>
                  <h3 className="mt-3 flex items-center gap-2 font-semibold text-ink-900">
                    {r.nombre}
                    <Badge variant={r.opcional ? "secondary" : "accent"} className="text-[10px]">{r.opcional ? "opcional" : "base"}</Badge>
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-600">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CUMPLIMIENTO */}
        <section className="border-b py-16">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <Badge variant="steel"><Layers className="size-3" /> Flexible</Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-950">Tú eliges cómo entregar</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {FULFILLMENT_OPTIONS.map((f) => (
                <Card key={f.id}><CardContent className="p-6">
                  <PackageCheck className="size-7 text-safety" />
                  <h3 className="mt-3 font-semibold text-ink-900">{f.nombre}</h3>
                  <p className="mt-1.5 text-sm text-ink-600">{f.desc}</p>
                </CardContent></Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b bg-paper-300 py-16">
          <div className="container">
            <div className="mb-10 text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink-950">Preguntas frecuentes</h2>
              <p className="mt-2 text-ink-600">Todo lo que necesitas saber antes de aplicar.</p>
            </div>
            <FAQ />
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="relative overflow-hidden bg-ink-950 py-20 text-white">
          <div className="absolute inset-0 glow-accent" />
          <div className="container relative flex flex-col items-center gap-5 text-center">
            <Badge variant="purplecow"><Zap className="size-3.5" /> Cupos limitados de fundadores</Badge>
            <h2 className="max-w-3xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Aplica hoy y forma parte de Novak
            </h2>
            <p className="max-w-xl text-ink-300">
              Crea tu cuenta, explora la plataforma y envía tu solicitud. Te revisamos en 24–48h.
              Sin costo de entrada.
            </p>
            <Link href="/vender/registro" className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}>
              <Store className="size-4" /> Crear cuenta y aplicar
            </Link>
            <p className="flex items-center gap-1.5 text-sm text-ink-400"><Clock className="size-4" /> El alta toma menos de 10 minutos</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
