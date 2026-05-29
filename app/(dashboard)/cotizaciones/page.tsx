import { PageHeader } from "@/components/dashboard/page-header";
import { QuotationList, type QuoteVM } from "@/components/quotations/quotation-list";
import { QUOTATIONS, RFQS } from "@/lib/data/account";
import { getProvider } from "@/lib/data/providers";
import { getContext } from "@/lib/repos/context";
import { fetchOrders } from "@/lib/repos/orders";
import { creditProfile } from "@/lib/credit/engine";

export const metadata = { title: "Cotizaciones" };

export default async function CotizacionesPage() {
  const { company } = await getContext();
  const orders = await fetchOrders(company.id);
  const profile = creditProfile(company, orders);

  const pendientes = QUOTATIONS.filter((q) => q.estado === "enviada");
  const quotes: QuoteVM[] = pendientes.map((q) => {
    const rfq = RFQS.find((r) => r.id === q.rfq_id);
    const prov = getProvider(q.provider_id);
    return {
      id: q.id,
      folio: q.folio,
      rfqFolio: rfq?.folio ?? q.rfq_id,
      proveedor: prov?.nombre_comercial ?? "Proveedor",
      ciudad: prov?.ciudad ?? "",
      score: prov?.score ?? 0,
      subtotal: q.subtotal,
      comision: q.comision_broker,
      iva: q.iva,
      total: q.total,
      tiempo_entrega_horas: q.tiempo_entrega_horas,
      condicion_pago: q.condicion_pago,
      valida_hasta: q.valida_hasta,
      categoria: rfq?.items[0] ? undefined : undefined,
      providerId: q.provider_id,
    };
  });

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
