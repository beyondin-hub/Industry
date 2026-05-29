import { PageHeader } from "@/components/dashboard/page-header";
import { QuickOrder } from "@/components/quick-order/quick-order";

export const metadata = { title: "Quick Order" };

export default function QuickOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quick Order"
        description="¿Sabes los números de parte? Pégalos o sube tu Excel y arma el pedido en 60 segundos."
      />
      <QuickOrder />
    </div>
  );
}
