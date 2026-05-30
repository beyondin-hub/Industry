import { MessagesSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { SupportCenter } from "@/components/admin/support-center";
import { fetchTickets } from "@/lib/repos/support";

export const metadata = { title: "Soporte y mensajería" };

export default async function SoportePage() {
  const tickets = await fetchTickets();
  const abiertos = tickets.filter((t) => t.estado === "abierto").length;
  const alta = tickets.filter((t) => t.prioridad === "alta").length;
  const resueltos = tickets.filter((t) => t.estado === "resuelto").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Soporte y mensajería" description="Tickets e intervención de conversaciones — con datos de contacto protegidos" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tickets abiertos" value={String(abiertos)} icon={MessagesSquare} accent="text-safety" />
        <StatCard label="Prioridad alta" value={String(alta)} icon={AlertTriangle} accent="text-danger" />
        <StatCard label="Resueltos" value={String(resueltos)} icon={CheckCircle2} accent="text-emerald-600" />
      </div>
      <SupportCenter tickets={tickets} />
    </div>
  );
}
