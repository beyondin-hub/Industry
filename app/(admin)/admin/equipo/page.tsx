import { Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TeamManager } from "@/components/admin/team-manager";
import { TEAM_MEMBERS } from "@/lib/data/admin";

export const metadata = { title: "Equipo Novak" };

export default function EquipoPage() {
  const activos = TEAM_MEMBERS.filter((m) => m.activo).length;
  return (
    <div className="space-y-6">
      <PageHeader title="Equipo Novak" description="Operadores, roles y permisos de quienes gestionan Novak" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Operadores activos" value={String(activos)} icon={Users} accent="text-safety" />
        <StatCard label="Super admins" value={String(TEAM_MEMBERS.filter((m) => m.rol_admin === "super_admin").length)} icon={Users} accent="text-purplecow" />
        <StatCard label="Total en equipo" value={String(TEAM_MEMBERS.length)} icon={Users} accent="text-ink-700" />
      </div>
      <TeamManager initial={TEAM_MEMBERS} />
    </div>
  );
}
