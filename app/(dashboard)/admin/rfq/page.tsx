import { ClipboardList, AlertTriangle, Clock, TrendingUp, Percent } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RFQKanban } from "@/components/admin/rfq-kanban";
import { CURRENT_COMPANY, ORDERS } from "@/lib/data/account";
import { fetchRFQs } from "@/lib/repos/rfqs";
import { tiempoRestante, mxn } from "@/lib/utils";

export const metadata = { title: "Mesa de operaciones" };

export default async function AdminRFQPage() {
  const rfqs = await fetchRFQs();
  const abiertos = rfqs.filter((r) => r.estado !== "cerrado" && r.estado !== "aprobado");
  const enRiesgo = abiertos.filter((r) => tiempoRestante(r.deadline_cotizacion).vencido).length;
  const ganados = rfqs.filter((r) => r.estado === "aprobado").length;
  const cerrados = rfqs.filter((r) => r.estado === "aprobado" || r.estado === "cerrado").length;
  const conversion = cerrados ? Math.round((ganados / cerrados) * 100) : 0;
  const gmvMes = ORDERS.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mesa de operaciones"
        description="Pipeline de RFQs · cumple la garantía de 2h. Arrastra las tarjetas entre columnas."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="GMV del mes" value={mxn(gmvMes)} icon={TrendingUp} accent="text-emerald-600" />
        <StatCard label="RFQ abiertos" value={String(abiertos.length)} icon={ClipboardList} accent="text-safety" />
        <StatCard label="SLA en riesgo" value={String(enRiesgo)} icon={AlertTriangle} accent="text-danger" />
        <StatCard label="Tiempo prom. respuesta" value="1h 24m" hint="meta < 2h" icon={Clock} accent="text-purplecow" />
        <StatCard label="Conversión RFQ→Orden" value={`${conversion}%`} icon={Percent} accent="text-info" />
      </div>

      <RFQKanban initial={rfqs} companyName={CURRENT_COMPANY.nombre} />
    </div>
  );
}
