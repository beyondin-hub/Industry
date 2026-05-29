import { PageHeader } from "@/components/dashboard/page-header";
import { RFQWizard } from "@/components/rfq/rfq-wizard";
import { getContext } from "@/lib/repos/context";

export const metadata = { title: "Solicitar cotización (RFQ)" };

export default async function CotizarPage({
  searchParams,
}: {
  searchParams: { sku?: string; qty?: string };
}) {
  const { company } = await getContext();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitar cotización"
        description="Un solo RFQ, múltiples proveedores cotizan — confirmado en menos de 2 horas hábiles."
      />
      <RFQWizard
        presetSku={searchParams.sku}
        presetQty={searchParams.qty ? Number(searchParams.qty) : undefined}
        company={{ nombre: company.nombre, rfc: company.rfc, ciudad: company.ciudad }}
      />
    </div>
  );
}
