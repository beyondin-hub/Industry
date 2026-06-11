import { Warehouse, Boxes, Lock, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { WarehouseManager } from "@/components/admin/warehouse-manager";
import { fetchInventory, fetchMovements } from "@/lib/repos/warehouse";
import { mxn } from "@/lib/utils";

export const metadata = { title: "Bodega / Fulfillment" };

export default async function BodegaPage() {
  const [inventory, movements] = await Promise.all([fetchInventory(), fetchMovements()]);
  const skus = inventory.length;
  const unidades = inventory.reduce((a, i) => a + i.stock, 0);
  const reservado = inventory.reduce((a, i) => a + i.reservado, 0);
  const bajoMin = inventory.filter((i) => i.bajo_minimo).length;
  const valor = inventory.reduce((a, i) => a + i.stock * i.costo_unitario, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bodega · Fulfillment Hub Tijuana"
        description="Inventario consolidado bajo control de Novak. Habilita la entrega 24–48h en la franja fronteriza."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="SKUs en hub" value={String(skus)} icon={Boxes} accent="text-safety" />
        <StatCard label="Unidades en stock" value={unidades.toLocaleString("es-MX")} icon={Warehouse} accent="text-emerald-600" />
        <StatCard label="Reservado a órdenes" value={reservado.toLocaleString("es-MX")} icon={Lock} accent="text-info" />
        <StatCard label="SKUs bajo mínimo" value={String(bajoMin)} icon={AlertTriangle} accent="text-danger" />
      </div>
      <p className="text-sm text-ink-500">
        Valor del inventario consignado: <span className="font-semibold text-ink-800">{mxn(valor)}</span>
      </p>
      <WarehouseManager inventory={inventory} movements={movements} />
    </div>
  );
}
