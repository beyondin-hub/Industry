import { PageHeader } from "@/components/dashboard/page-header";
import { ProductImporter } from "@/components/proveedor/product-importer";

export const metadata = { title: "Subir productos" };

export default function ProveedorProductosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Subir productos"
        description="Importa tu catálogo y deja que Novak IA complete las fichas — o agrégalos manualmente. Tú validas y publicas."
      />
      <ProductImporter />
    </div>
  );
}
