import { PageHeader } from "@/components/dashboard/page-header";
import { QuotationList } from "@/components/quotations/quotation-list";
import { getContext } from "@/lib/repos/context";
import { fetchOrders } from "@/lib/repos/orders";
import { fetchQuotationVMs } from "@/lib/repos/quotations";
import { creditProfile } from "@/lib/credit/engine";

export const metadata = { title: "Cotizaciones" };

export default async function CotizacionesPage() {
  const { company } = await getContext();
  const [orders, quotes] = await Promise.all([
    fetchOrders(company.id),
    fetchQuotationVMs(company.id),
  ]);
  const profile = creditProfile(company, orders);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cotizaciones"
        description="Revisa y aprueba las cotizaciones de tus RFQ. Acepta de contado o con tu línea de crédito."
      />
      <QuotationList quotes={quotes} creditoDisponible={profile.disponible} />
    </div>
  );
}
