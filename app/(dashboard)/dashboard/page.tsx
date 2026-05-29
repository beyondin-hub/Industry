import Link from "next/link";
import {
  FileSpreadsheet,
  Truck,
  CreditCard,
  TrendingUp,
  Clock,
  ArrowRight,
  Repeat,
  RotateCw,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RFQStatus, OrdenStatus, UrgenciaBadge } from "@/components/shared/status-badge";
import { AUTO_REORDERS } from "@/lib/data/account";
import { getProduct } from "@/lib/data/products";
import { getProvider } from "@/lib/data/providers";
import { getContext } from "@/lib/repos/context";
import { fetchRFQs } from "@/lib/repos/rfqs";
import { fetchOrders } from "@/lib/repos/orders";
import { mxn, tiempoRestante, fechaCorta, entregaLabel, num } from "@/lib/utils";
import { categoriaNombre } from "@/lib/constants";

export default async function DashboardPage() {
  const { buyer: CURRENT_BUYER, company: CURRENT_COMPANY } = await getContext();
  const [rfqs, orders] = await Promise.all([
    fetchRFQs(CURRENT_COMPANY.id),
    fetchOrders(CURRENT_COMPANY.id),
  ]);
  const activos = rfqs.filter((r) => r.estado === "en_proceso" || r.estado === "cotizado");
  const enTransito = orders.filter((o) => o.estado === "en_transito" || o.estado === "en_preparacion");
  const creditoUsado = orders.filter((o) => o.es_credito).reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hola, ${CURRENT_BUYER.nombre.split(" ")[0]} 👋`}
        description={`${CURRENT_COMPANY.nombre} · ${CURRENT_COMPANY.ciudad}`}
      >
        <Link href="/cotizar" className={buttonVariants({ variant: "accent" })}>
          <Plus className="size-4" /> Nueva cotización
        </Link>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="RFQ activos"
          value={String(activos.length)}
          hint="En cotización o por aprobar"
          icon={FileSpreadsheet}
          accent="text-purplecow"
        />
        <StatCard
          label="Órdenes en curso"
          value={String(enTransito.length)}
          hint="En preparación / tránsito"
          icon={Truck}
          accent="text-safety"
        />
        <StatCard
          label="Crédito disponible"
          value={mxn(CURRENT_COMPANY.limite_credito - creditoUsado)}
          hint={`de ${mxn(CURRENT_COMPANY.limite_credito)} · ${CURRENT_COMPANY.dias_credito} días`}
          icon={CreditCard}
          accent="text-emerald-600"
        />
        <StatCard
          label="Gasto este mes"
          value={mxn(144400)}
          hint="+12% vs. mes anterior"
          icon={TrendingUp}
          accent="text-steel-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* RFQ que requieren atención */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Cotizaciones en curso</CardTitle>
            <Link href="/cotizar" className="text-sm font-medium text-safety hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {activos.map((rfq) => {
              const t = tiempoRestante(rfq.deadline_cotizacion);
              return (
                <Link
                  key={rfq.id}
                  href="/cotizar"
                  className="flex items-center justify-between gap-3 rounded-lg border p-3.5 transition-colors hover:border-safety hover:bg-steel-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-steel-900">{rfq.folio}</span>
                      <RFQStatus estado={rfq.estado} />
                      <UrgenciaBadge urgencia={rfq.urgencia} />
                    </div>
                    <p className="mt-1 truncate text-sm text-steel-500">
                      {rfq.items.length} partidas · {rfq.notas}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant={t.vencido ? "danger" : "purplecow"}>
                      <Clock className="size-3" /> {t.vencido ? "Vencido" : `Cotiza en ${t.label}`}
                    </Badge>
                    <p className="mt-1 text-sm font-semibold text-steel-900">
                      ~{mxn(rfq.total_estimado)}
                    </p>
                  </div>
                </Link>
              );
            })}
            {activos.length === 0 && (
              <p className="py-6 text-center text-sm text-steel-500">
                No tienes cotizaciones activas.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Reorden automático */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Repeat className="size-4 text-safety" /> Reorden automático
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {AUTO_REORDERS.map((ar) => {
              const p = getProduct(ar.product_id);
              if (!p) return null;
              return (
                <div key={ar.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium text-steel-900">{p.nombre}</p>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-steel-500">
                    <span>
                      {num(ar.cantidad)} {p.unidad} · cada {ar.frecuencia_dias}d
                    </span>
                    <Badge variant="success">−{ar.descuento_pct}%</Badge>
                  </div>
                  <p className="mt-1 text-xs text-steel-500">
                    Próximo: {fechaCorta(ar.proxima_fecha)}
                  </p>
                </div>
              );
            })}
            <Link
              href="/reordenes"
              className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}
            >
              Gestionar reórdenes
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Órdenes recientes con tracking */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Órdenes recientes</CardTitle>
            <Link href="/ordenes" className="text-sm font-medium text-safety hover:underline">
              Ver historial
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.slice(0, 4).map((o) => {
              const prov = getProvider(o.provider_id);
              return (
                <Link
                  key={o.id}
                  href="/ordenes"
                  className="flex items-center justify-between gap-3 rounded-lg border p-3.5 hover:bg-steel-50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-steel-900">{o.folio}</span>
                      <OrdenStatus estado={o.estado} />
                    </div>
                    <p className="mt-1 text-sm text-steel-500">
                      {categoriaNombre(o.categoria)} · {prov?.nombre_comercial}
                      {o.es_credito && " · a crédito"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-steel-900">{mxn(o.total)}</p>
                    <p className="text-xs text-steel-500">{fechaCorta(o.created_at)}</p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Recompra en 1 clic (Grainger reorder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCw className="size-4 text-safety" /> Recompra rápida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {["sku-6205", "sku-guante-nitrilo", "sku-grasa-ep2"].map((id) => {
              const p = getProduct(id);
              if (!p) return null;
              return (
                <div key={id} className="flex items-center justify-between gap-2 rounded-lg border p-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-steel-900">{p.nombre}</p>
                    <p className="text-xs text-emerald-600">{entregaLabel(p.tiempo_entrega_horas, CURRENT_COMPANY.ciudad)}</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0">
                    <RotateCw className="size-3.5" /> Recomprar
                  </Button>
                </div>
              );
            })}
            <Link href="/catalogo" className="flex items-center justify-center gap-1 pt-1 text-sm font-medium text-safety hover:underline">
              Explorar catálogo <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
