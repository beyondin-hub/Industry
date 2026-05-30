import Link from "next/link";
import { TrendingUp, ClipboardList, AlertTriangle, Clock, Percent, Landmark, Inbox } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { fetchPendingProviders } from "@/lib/repos/providers";
import { fetchRFQs } from "@/lib/repos/rfqs";
import { fetchOrders } from "@/lib/repos/orders";
import { tiempoRestante, mxn, cn } from "@/lib/utils";
import { COMISION } from "@/lib/credit/engine";

export const metadata = { title: "Panel Novak" };

export default async function AdminDashboard() {
  const [pendientes, RFQS, ORDERS] = await Promise.all([
    fetchPendingProviders(),
    fetchRFQs(),
    fetchOrders(),
  ]);
  const abiertos = RFQS.filter((r) => r.estado !== "cerrado" && r.estado !== "aprobado");
  const enRiesgo = abiertos.filter((r) => tiempoRestante(r.deadline_cotizacion).vencido).length;
  const ganados = RFQS.filter((r) => r.estado === "aprobado").length;
  const cerrados = RFQS.filter((r) => r.estado === "aprobado" || r.estado === "cerrado").length;
  const conversion = cerrados ? Math.round((ganados / cerrados) * 100) : 0;
  const gmv = ORDERS.reduce((s, o) => s + o.total, 0);
  const margenNovak = gmv - gmv / (1 + COMISION); // aproximación del margen por comisión
  const porCobrar = ORDERS.filter((o) => o.es_credito && !o.pagado).reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Panel Novak" description="Salud del marketplace, SLA de la garantía 2h y finanzas del broker" />

      {pendientes.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-safety/30 bg-safety-50 p-4">
          <Inbox className="size-5 shrink-0 text-safety" />
          <p className="flex-1 text-sm text-ink-800">
            <strong>{pendientes.length} solicitud(es) de proveedor</strong> esperando aprobación.
          </p>
          <Link href="/admin/proveedores" className={cn(buttonVariants({ variant: "gradient", size: "sm" }))}>Revisar solicitudes</Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="GMV (acumulado)" value={mxn(gmv)} icon={TrendingUp} accent="text-emerald-600" />
        <StatCard label="Margen Novak (comisión)" value={mxn(margenNovak)} icon={Percent} accent="text-safety" />
        <StatCard label="Por cobrar (crédito)" value={mxn(porCobrar)} icon={Landmark} accent="text-info" />
        <StatCard label="Conversión RFQ→Orden" value={`${conversion}%`} icon={Percent} accent="text-purplecow" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="RFQ abiertos" value={String(abiertos.length)} icon={ClipboardList} accent="text-safety" />
        <StatCard label="SLA en riesgo" value={String(enRiesgo)} icon={AlertTriangle} accent="text-danger" />
        <StatCard label="Tiempo prom. respuesta" value="1h 24m" hint="meta < 2h" icon={Clock} accent="text-purplecow" />
        <StatCard label="Cumplimiento 2h" value="94%" hint="últimos 30 días" icon={Clock} accent="text-emerald-600" />
      </div>

      <Card>
        <CardHeader><CardTitle>Accesos rápidos</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            { t: "Mesa de operaciones", d: "Pipeline de RFQs y SLA", href: "/admin/rfq" },
            { t: "Constructor de cotizaciones", d: "Arma el quote para el comprador", href: "/admin/cotizador" },
            { t: "Tesorería y crédito", d: "Cobranza, dispersión y margen", href: "/admin/tesoreria" },
          ].map((a) => (
            <a key={a.href} href={a.href} className="rounded-xl border p-4 transition-colors hover:border-safety hover:bg-secondary/40">
              <p className="font-semibold text-ink-900">{a.t}</p>
              <p className="mt-1 text-sm text-ink-500">{a.d}</p>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
