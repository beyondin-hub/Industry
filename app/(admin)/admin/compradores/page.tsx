import { Building, ShieldCheck, Landmark, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { BuyerManager } from "@/components/admin/buyer-manager";
import { BUYER_COMPANIES } from "@/lib/data/admin";
import { mxn } from "@/lib/utils";

export const metadata = { title: "Compradores y crédito" };

export default function CompradoresPage() {
  const lineaTotal = BUYER_COMPANIES.reduce((s, c) => s + c.limite_credito, 0);
  const exposicion = BUYER_COMPANIES.reduce((s, c) => s + c.exposicion, 0);
  const kycPend = BUYER_COMPANIES.filter((c) => c.kyc_estado === "pendiente").length;
  const enRiesgo = BUYER_COMPANIES.filter((c) => c.limite_credito > 0 && c.exposicion / c.limite_credito > 0.85).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Compradores y crédito" description="Empresas compradoras, KYC, líneas de crédito y exposición" />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Línea total otorgada" value={mxn(lineaTotal)} icon={Landmark} accent="text-info" />
        <StatCard label="Exposición vigente" value={mxn(exposicion)} icon={Building} accent="text-safety" />
        <StatCard label="KYC pendientes" value={String(kycPend)} icon={ShieldCheck} accent="text-amber-600" />
        <StatCard label="En riesgo (>85%)" value={String(enRiesgo)} icon={AlertTriangle} accent="text-danger" />
      </div>
      <BuyerManager initial={BUYER_COMPANIES} />
    </div>
  );
}
