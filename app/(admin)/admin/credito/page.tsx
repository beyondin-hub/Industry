import { CreditCard, Inbox, Landmark } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { CreditQueue } from "@/components/admin/credit-queue";
import { fetchCreditRequests } from "@/lib/repos/credit-requests";
import { mxn } from "@/lib/utils";

export const metadata = { title: "Solicitudes de crédito" };

export default async function AdminCreditoPage() {
  const requests = await fetchCreditRequests();
  const solicitado = requests.reduce((s, r) => s + r.limite_solicitado, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Solicitudes de crédito" description="Cola de aprobación de líneas — corre el scoring y resuelve" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Solicitudes pendientes" value={String(requests.length)} icon={Inbox} accent="text-safety" />
        <StatCard label="Monto solicitado" value={mxn(solicitado)} icon={Landmark} accent="text-info" />
        <StatCard label="Decisión meta" value="< 24h" icon={CreditCard} accent="text-purplecow" />
      </div>
      <CreditQueue requests={requests} />
    </div>
  );
}
