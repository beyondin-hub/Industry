import { Bell, Zap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { AutomationManager } from "@/components/admin/automation-manager";
import { fetchNotificationRules } from "@/lib/repos/content";

export const metadata = { title: "Automatizaciones" };

export default async function AutomatizacionesPage() {
  const rules = await fetchNotificationRules();
  const activas = rules.filter((r) => r.activo).length;
  return (
    <div className="space-y-6">
      <PageHeader title="Automatizaciones de notificaciones" description="Qué se envía, por qué canal y con qué mensaje — en cada evento" />
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Reglas activas" value={String(activas)} icon={Zap} accent="text-emerald-600" />
        <StatCard label="Reglas totales" value={String(rules.length)} icon={Bell} accent="text-safety" />
      </div>
      <AutomationManager initial={rules} />
    </div>
  );
}
