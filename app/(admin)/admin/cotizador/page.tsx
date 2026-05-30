import { PageHeader } from "@/components/dashboard/page-header";
import { QuoteBuilder, type RFQVM, type ProvVM } from "@/components/admin/quote-builder";
import { CURRENT_COMPANY } from "@/lib/data/account";
import { PROVIDERS } from "@/lib/data/providers";
import { fetchRFQs } from "@/lib/repos/rfqs";

export const metadata = { title: "Constructor de cotizaciones" };

export default async function CotizadorPage() {
  const allRfqs = await fetchRFQs();
  const porCotizar = allRfqs.filter((r) => r.estado === "nuevo" || r.estado === "en_proceso" || r.estado === "cotizado");
  const rfqs: RFQVM[] = porCotizar.map((r) => ({
    id: r.id,
    folio: r.folio,
    empresa: CURRENT_COMPANY.nombre,
    condicion_pago: r.condicion_pago,
    items: r.items.map((it) => ({
      id: it.id, descripcion: it.descripcion, numero_parte: it.numero_parte, cantidad: it.cantidad, unidad: it.unidad,
    })),
  }));
  const providers: ProvVM[] = PROVIDERS.map((p) => ({ id: p.id, nombre: p.nombre_comercial, score: p.score }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Constructor de cotizaciones"
        description="Arma el quote de un RFQ: define precios, proveedor y comisión. El comprador lo recibe para aceptar."
      />
      <QuoteBuilder rfqs={rfqs} providers={providers} />
    </div>
  );
}
