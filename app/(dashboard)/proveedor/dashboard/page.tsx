import Link from "next/link";
import {
  Store,
  FileSpreadsheet,
  TrendingUp,
  Package,
  Star,
  Send,
  Crown,
  ShieldCheck,
  Sparkles,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UrgenciaBadge } from "@/components/shared/status-badge";
import { CatalogManager } from "@/components/proveedor/catalog-manager";
import { RFQS, CURRENT_COMPANY } from "@/lib/data/account";
import { PRODUCTS } from "@/lib/data/products";
import { getProviderContext } from "@/lib/repos/provider-context";
import { maskBuyer } from "@/lib/anti-bypass";
import { REVENUE_STREAMS } from "@/lib/pricing/provider";
import { INDUSTRIAS } from "@/lib/constants";
import { mxn, tiempoRestante, num, cn } from "@/lib/utils";

export const metadata = { title: "Portal de proveedor" };

export default async function ProveedorDashboard() {
  const { provider: prov, isDemo } = await getProviderContext();
  const misProductos = isDemo ? PRODUCTS.filter((p) => p.provider_id === prov.id) : [];
  const rfqsAbiertos = RFQS.filter((r) => r.estado !== "cerrado");
  const industriaLabel = INDUSTRIAS.find((i) => i.slug === CURRENT_COMPANY.industria)?.nombre ?? "manufactura";
  const buyerMask = maskBuyer({ industria: industriaLabel, ciudad: CURRENT_COMPANY.ciudad });

  return (
    <div className="space-y-6">
      <PageHeader
        title={prov.nombre_comercial}
        description={`Portal de proveedor · ${prov.ciudad}`}
      >
        <div className="flex items-center gap-2">
          <Badge variant="purplecow"><Crown className="size-3" /> Proveedor Fundador</Badge>
          <Link href="/proveedor/mensajes" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Mensajes
          </Link>
          <Link href="/proveedor/productos" className={cn(buttonVariants({ variant: "gradient", size: "sm" }))}>
            <Sparkles className="size-4" /> Subir catálogo (IA)
          </Link>
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="RFQ por cotizar" value={String(rfqsAbiertos.length)} icon={FileSpreadsheet} accent="text-safety" />
        <StatCard label="Productos en catálogo" value={String(misProductos.length)} icon={Package} accent="text-steel-700" />
        <StatCard label="Ventas del mes" value={mxn(284500)} hint="+18% vs. mes anterior" icon={TrendingUp} accent="text-emerald-600" />
        <StatCard label="Score" value={`${prov.score} ⭐`} hint="Tasa respuesta 96%" icon={Star} accent="text-amber-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* RFQ entrantes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-safety" /> Solicitudes de cotización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rfqsAbiertos.map((rfq) => {
              const t = tiempoRestante(rfq.deadline_cotizacion);
              return (
                <div key={rfq.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-steel-900">{rfq.folio}</span>
                      <UrgenciaBadge urgencia={rfq.urgencia} />
                    </div>
                    <Badge variant={t.vencido ? "danger" : "purplecow"}>
                      SLA: {t.vencido ? "vencido" : t.label}
                    </Badge>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-500">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    {buyerMask.etiqueta} · {buyerMask.industria} · {buyerMask.ciudad}
                    <Lock className="ml-1 size-3 text-ink-400" />
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-steel-600">
                    {rfq.items.map((it) => (
                      <li key={it.id}>
                        • {num(it.cantidad)} {it.unidad} — {it.descripcion}
                        {it.certificacion_requerida && (
                          <Badge variant="steel" className="ml-1 text-[10px]">{it.certificacion_requerida}</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-steel-500">Pago: {rfq.condicion_pago === "contado" ? "contado" : `${rfq.condicion_pago} días`}</span>
                    <Button variant="accent" size="sm">
                      <Send className="size-3.5" /> Enviar cotización
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Plan y modelo */}
        <Card>
          <CardHeader>
            <CardTitle>Tu plan: Fundador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-safety/40 bg-safety-50/50 p-3">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg font-extrabold text-ink-950">$0<span className="text-xs font-normal text-ink-500">/mes</span></span>
                <Badge variant="success">sin mensualidad</Badge>
              </div>
              <p className="mt-1 text-xs text-ink-600">Solo pagas comisión cuando vendes. Sin cuota de entrada.</p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Cómo ganamos juntos</p>
            <div className="space-y-1.5">
              {REVENUE_STREAMS.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span className="flex items-center gap-1.5 text-xs text-ink-700">
                    <r.icon className="size-3.5 text-safety" /> {r.nombre}
                  </span>
                  <span className="font-mono text-xs font-semibold text-ink-900">{r.valor}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-ink-400">Los fees opcionales solo aplican si activas el servicio (financiamiento, fulfillment, etc.).</p>
          </CardContent>
        </Card>
      </div>

      {/* Mis productos — CRUD */}
      <CatalogManager initial={misProductos} />
    </div>
  );
}
