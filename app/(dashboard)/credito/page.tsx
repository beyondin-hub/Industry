import { PageHeader } from "@/components/dashboard/page-header";
import { CreditPanel, type CreditOrderVM } from "@/components/credit/credit-panel";
import { getContext } from "@/lib/repos/context";
import { fetchOrders } from "@/lib/repos/orders";
import { getProvider } from "@/lib/data/providers";
import { creditProfile } from "@/lib/credit/engine";

export const metadata = { title: "Crédito y facturación" };

export default async function CreditoPage() {
  const { company } = await getContext();
  const orders = await fetchOrders(company.id);
  const profile = creditProfile(company, orders);

  const creditOrders: CreditOrderVM[] = orders
    .filter((o) => o.es_credito)
    .map((o) => ({
      id: o.id,
      folio: o.folio,
      total: o.total,
      vence: o.fecha_vencimiento_credito,
      pagado: !!o.pagado,
      proveedor: getProvider(o.provider_id)?.nombre_comercial ?? "Proveedor",
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crédito y facturación"
        description="Novak otorga tu línea, paga a tus proveedores y te cobra a ti. Gestiona tu crédito y tus pagos aquí."
      />
      <CreditPanel
        profile={{
          limite: profile.limite,
          usado: profile.usado,
          disponible: profile.disponible,
          utilizacionPct: profile.utilizacionPct,
          dias: profile.dias,
        }}
        orders={creditOrders}
      />
    </div>
  );
}
