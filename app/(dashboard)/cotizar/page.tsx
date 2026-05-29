import { PageHeader } from "@/components/dashboard/page-header";
import { RFQForm } from "@/components/rfq/rfq-form";

export const metadata = { title: "Solicitar cotización (RFQ)" };

export default function CotizarPage({
  searchParams,
}: {
  searchParams: { sku?: string; qty?: string };
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitar cotización"
        description="Sube tu lista, pega números de parte o describe lo que necesitas — un solo RFQ, múltiples proveedores cotizan."
      />
      <RFQForm
        presetSku={searchParams.sku}
        presetQty={searchParams.qty ? Number(searchParams.qty) : undefined}
      />
    </div>
  );
}
