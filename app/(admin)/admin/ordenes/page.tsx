import { Truck, CheckCircle2, Clock, Wallet } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrdersTable, type OrderVM } from "@/components/admin/orders-table";
import { fetchOrders } from "@/lib/repos/orders";
import { getProvider } from "@/lib/data/providers";
import { BUYER_COMPANIES } from "@/lib/data/admin";
import { categoriaNombre } from "@/lib/constants";
import { mxn } from "@/lib/utils";
import type { CategoriaMRO } from "@/types";

export const metadata = { title: "Órdenes" };

export default async function AdminOrdenesPage() {
  const orders = await fetchOrders();
  const vms: OrderVM[] = orders.map((o) => ({
    id: o.id,
    folio: o.folio,
    empresa: BUYER_COMPANIES.find((c) => c.id === o.company_id)?.nombre ?? "Comprador",
    proveedor: getProvider(o.provider_id)?.nombre_comercial ?? "Proveedor",
    categoria: categoriaNombre(o.categoria as CategoriaMRO),
    total: o.total,
    estado: o.estado,
    es_credito: o.es_credito,
    pagado: !!o.pagado,
    created_at: o.created_at,
  }));

  const enCurso = vms.filter((o) => o.estado === "confirmada" || o.estado === "en_preparacion" || o.estado === "en_transito").length;
  const entregadas = vms.filter((o) => o.estado === "entregada").length;
  const gmv = vms.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Órdenes" description="Todas las órdenes del marketplace — cambia estados y gestiona incidencias" />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Órdenes totales" value={String(vms.length)} icon={Truck} accent="text-safety" />
        <StatCard label="En curso" value={String(enCurso)} icon={Clock} accent="text-amber-600" />
        <StatCard label="Entregadas" value={String(entregadas)} icon={CheckCircle2} accent="text-emerald-600" />
        <StatCard label="GMV" value={mxn(gmv)} icon={Wallet} accent="text-info" />
      </div>
      <OrdersTable orders={vms} />
    </div>
  );
}
