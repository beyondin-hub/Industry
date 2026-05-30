import { PackageSearch, ShieldCheck, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { CatalogModeration, type ProductModVM } from "@/components/admin/catalog-moderation";
import { fetchProducts } from "@/lib/repos/products";
import { getProvider } from "@/lib/data/providers";
import { categoriaNombre } from "@/lib/constants";

export const metadata = { title: "Catálogo global" };

export default async function AdminCatalogoPage() {
  const products = await fetchProducts();
  const vms: ProductModVM[] = products.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    numero_parte: p.numero_parte,
    marca: p.marca,
    proveedor: getProvider(p.provider_id)?.nombre_comercial ?? "Proveedor",
    categoria: categoriaNombre(p.categoria),
    precio: p.precio_base,
    stock: p.stock_actual,
    activo: p.activo,
  }));
  const publicados = vms.filter((p) => p.activo).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Catálogo global" description="Busca, modera y gestiona todos los productos del marketplace" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Productos totales" value={String(vms.length)} icon={PackageSearch} accent="text-safety" />
        <StatCard label="Publicados" value={String(publicados)} icon={ShieldCheck} accent="text-emerald-600" />
        <StatCard label="Ocultos" value={String(vms.length - publicados)} icon={EyeOff} accent="text-ink-500" />
      </div>
      <CatalogModeration products={vms} />
    </div>
  );
}
