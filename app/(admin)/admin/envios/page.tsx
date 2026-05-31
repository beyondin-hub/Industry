import { MapPin, Warehouse, Truck, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ShipmentsTower } from "@/components/admin/shipments-tower";
import { fetchShipments } from "@/lib/repos/shipments";

export const metadata = { title: "Torre de envíos" };

export default async function EnviosPage() {
  const shipments = await fetchShipments();
  const fulfillment = shipments.filter((s) => s.modo === "fulfillment_tj").length;
  const dropship = shipments.filter((s) => s.modo === "dropshipping").length;
  const enTransito = shipments.filter((s) => s.estado === "en_transito").length;
  const incidencias = shipments.filter((s) => s.estado === "incidencia").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Torre de control de envíos" description="Ruteo, guías, Carta Porte y rastreo de toda la red logística" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Fulfillment Tijuana" value={String(fulfillment)} icon={Warehouse} accent="text-emerald-600" />
        <StatCard label="Dropshipping" value={String(dropship)} icon={Truck} accent="text-safety" />
        <StatCard label="En tránsito" value={String(enTransito)} icon={MapPin} accent="text-info" />
        <StatCard label="Incidencias" value={String(incidencias)} icon={AlertTriangle} accent="text-danger" />
      </div>
      <ShipmentsTower shipments={shipments} />
    </div>
  );
}
