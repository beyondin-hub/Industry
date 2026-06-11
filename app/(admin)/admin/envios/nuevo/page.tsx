import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ManualShipmentBuilder } from "@/components/admin/manual-shipment-builder";

export const metadata = { title: "Nuevo envío manual" };

export default function NuevoEnvioPage() {
  return (
    <div className="space-y-6">
      <Link href="/admin/envios" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-4" /> Torre de envíos
      </Link>
      <PageHeader
        title="Generar envío manual"
        description="Cotiza tarifas multi-carrier en vivo, elige la óptima y genera la guía + Carta Porte."
      />
      <ManualShipmentBuilder />
    </div>
  );
}
