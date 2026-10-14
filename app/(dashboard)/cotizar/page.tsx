import { PageHeader } from "@/components/dashboard/page-header";
import { RFQWizard } from "@/components/rfq/rfq-wizard";
import { getContext } from "@/lib/repos/context";
import { getProduct } from "@/lib/data/products";
import { getSectorProduct, getSector } from "@/lib/data/sectors";

export const metadata = { title: "Solicitar cotización (RFQ)" };

export default async function CotizarPage({
  searchParams,
}: {
  searchParams: { sku?: string; qty?: string; producto?: string; q?: string; sector?: string };
}) {
  const { company } = await getContext();

  // Prefill desde cualquier origen de enlace (no perder params):
  //  - sku: producto del catálogo interno (lo resuelve el wizard por id).
  //  - producto: id de producto regular o de producto sectorial.
  //  - q: término/número de parte libre (búsqueda sin match, importar lista).
  //  - sector: contexto → nota inicial.
  let presetSku = searchParams.sku;
  let presetDescripcion: string | undefined;
  let presetNumeroParte: string | undefined;
  let presetUnidad: string | undefined;

  if (!presetSku && searchParams.producto) {
    if (getProduct(searchParams.producto)) {
      presetSku = searchParams.producto;
    } else {
      const sp = getSectorProduct(searchParams.producto);
      if (sp) {
        presetDescripcion = sp.nombre;
        presetNumeroParte = sp.sku;
        presetUnidad = sp.unidad;
      }
    }
  }
  if (!presetSku && !presetDescripcion && searchParams.q) {
    presetDescripcion = searchParams.q;
    presetNumeroParte = searchParams.q;
  }
  const sectorBrand = searchParams.sector ? getSector(searchParams.sector)?.nombre_brand : undefined;
  const presetNota = sectorBrand ? `Sector: ${sectorBrand}` : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitar cotización"
        description="Un solo RFQ, múltiples proveedores cotizan — confirmado en menos de 2 horas hábiles."
      />
      <RFQWizard
        presetSku={presetSku}
        presetQty={searchParams.qty ? Number(searchParams.qty) : undefined}
        presetDescripcion={presetDescripcion}
        presetNumeroParte={presetNumeroParte}
        presetUnidad={presetUnidad}
        presetNota={presetNota}
        company={{ nombre: company.nombre, rfc: company.rfc, ciudad: company.ciudad }}
      />
    </div>
  );
}
