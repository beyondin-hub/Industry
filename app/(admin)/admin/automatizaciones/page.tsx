import { Bell, Zap, Clock, Timer } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AutomationManager } from "@/components/admin/automation-manager";
import { fetchNotificationRules } from "@/lib/repos/content";
import { CRON_JOBS } from "@/lib/cron/jobs";

export const metadata = { title: "Automatizaciones" };

export default async function AutomatizacionesPage() {
  const rules = await fetchNotificationRules();
  const activas = rules.filter((r) => r.activo).length;
  return (
    <div className="space-y-6">
      <PageHeader title="Automatizaciones de notificaciones" description="Qué se envía, por qué canal y con qué mensaje — en cada evento" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Reglas activas" value={String(activas)} icon={Zap} accent="text-emerald-600" />
        <StatCard label="Reglas totales" value={String(rules.length)} icon={Bell} accent="text-safety" />
        <StatCard label="Tareas programadas" value={String(CRON_JOBS.length)} icon={Timer} accent="text-info" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4 text-safety" /> Tareas programadas (Vercel Cron)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {CRON_JOBS.map((j) => (
              <div key={j.path} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink-900">{j.nombre}</span>
                    <Badge variant="secondary">{j.cadencia}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">{j.descripcion}</p>
                </div>
                <code className="rounded bg-ink-950 px-2 py-1 text-[11px] text-ink-200">{j.schedule}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AutomationManager initial={rules} />
    </div>
  );
}
