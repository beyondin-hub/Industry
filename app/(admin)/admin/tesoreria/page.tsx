import { Landmark, ArrowDownToLine, ArrowUpFromLine, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TreasuryTable, type TreasuryRow } from "@/components/admin/treasury-table";
import { ORDERS } from "@/lib/data/account";
import { getProvider } from "@/lib/data/providers";
import { reverseDesglose } from "@/lib/credit/engine";
import { mxn } from "@/lib/utils";

export const metadata = { title: "Tesorería y crédito" };

export default function TesoreriaPage() {
  const vigentes = ORDERS.filter((o) => o.estado !== "cancelada");

  const rows: TreasuryRow[] = vigentes.map((o) => {
    const r = reverseDesglose(o.total);
    return {
      id: o.id,
      folio: o.folio,
      proveedor: getProvider(o.provider_id)?.nombre_comercial ?? "Proveedor",
      providerId: o.provider_id,
      total: o.total,
      payout: r.payoutProveedor,
      margen: r.margenNovak,
      esCredito: o.es_credito,
      cobrado: !!o.pagado || !o.es_credito,
      // Demo: consideramos dispersado al proveedor cuando la orden ya se entregó y cobró.
      dispersado: !!o.pagado && o.estado === "entregada",
    };
  });

  const porCobrar = rows.filter((r) => !r.cobrado).reduce((s, r) => s + r.total, 0);
  const porPagar = rows.filter((r) => !r.dispersado).reduce((s, r) => s + r.payout, 0);
  const margen = rows.reduce((s, r) => s + r.margen, 0);
  const float = porCobrar - porPagar; // capital de trabajo que Novak adelanta

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tesorería y crédito"
        description="Novak cobra a la maquila y dispersa al proveedor. Aquí se concilia el flujo y el margen."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Por cobrar (maquilas)" value={mxn(porCobrar)} icon={ArrowDownToLine} accent="text-info" />
        <StatCard label="Por pagar (proveedores)" value={mxn(porPagar)} icon={ArrowUpFromLine} accent="text-safety" />
        <StatCard label="Margen Novak" value={mxn(margen)} hint="comisión acumulada" icon={TrendingUp} accent="text-emerald-600" />
        <StatCard label="Capital adelantado (float)" value={mxn(float)} hint="cobranza − dispersión" icon={Landmark} accent="text-purplecow" />
      </div>

      <TreasuryTable rows={rows} />
    </div>
  );
}
