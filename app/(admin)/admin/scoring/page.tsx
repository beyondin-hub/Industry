import { Gauge, ShieldAlert, EyeOff, Ban } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Scorecard } from "@/components/admin/scorecard";
import { fetchProviderScores } from "@/lib/scoring/metrics";

export const metadata = { title: "Scoring de proveedores" };

export default async function ScoringPage() {
  const rows = await fetchProviderScores();
  const prom = rows.length ? Math.round((rows.reduce((a, r) => a + r.breakdown.score, 0) / rows.length) * 10) / 10 : 0;
  const observacion = rows.filter((r) => r.breakdown.consecuencia === "flag").length;
  const visibilidad = rows.filter((r) => r.breakdown.consecuencia === "reducir_visibilidad").length;
  const suspendidos = rows.filter((r) => r.breakdown.consecuencia === "suspender").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scoring de proveedores"
        description="Score 0–10 por cumplimiento de la promesa Novak. El cron mensual recalcula y aplica consecuencias automáticas."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Score promedio" value={prom.toFixed(1)} icon={Gauge} accent="text-safety" />
        <StatCard label="En observación" value={String(observacion)} icon={ShieldAlert} accent="text-amber-600" />
        <StatCard label="Visibilidad reducida" value={String(visibilidad)} icon={EyeOff} accent="text-orange-600" />
        <StatCard label="Suspendidos" value={String(suspendidos)} icon={Ban} accent="text-danger" />
      </div>
      <Scorecard rows={rows} />
    </div>
  );
}
