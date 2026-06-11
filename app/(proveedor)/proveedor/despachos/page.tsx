import { PackageCheck, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DispatchList } from "@/components/proveedor/dispatch-list";
import { getProviderContext } from "@/lib/repos/provider-context";
import { fetchDispatches } from "@/lib/repos/dispatches";

export const metadata = { title: "Despachos" };

export default async function DespachosPage() {
  const { provider } = await getProviderContext();
  const despachos = await fetchDispatches(provider.id);
  const pendientes = despachos.filter((d) => d.estado === "pendiente" || d.estado === "impreso").length;
  const despachados = despachos.filter((d) => d.estado === "despachado").length;
  const vencidos = despachos.filter((d) => d.estado === "vencido").length;
  const slas = despachos.filter((d) => d.sla_horas != null).map((d) => d.sla_horas!);
  const slaProm = slas.length ? Math.round((slas.reduce((a, b) => a + b, 0) / slas.length) * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Despachos"
        description="Órdenes asignadas para surtir. Imprime la etiqueta Novak, sube evidencia y confirma el despacho antes del deadline."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Por despachar" value={String(pendientes)} icon={Clock} accent="text-amber-600" />
        <StatCard label="Despachados" value={String(despachados)} icon={CheckCircle2} accent="text-emerald-600" />
        <StatCard label="Vencidos" value={String(vencidos)} icon={AlertTriangle} accent="text-danger" />
        <StatCard label="SLA despacho prom." value={`${slaProm}h`} icon={PackageCheck} accent="text-safety" />
      </div>
      <DispatchList dispatches={despachos} />
    </div>
  );
}
