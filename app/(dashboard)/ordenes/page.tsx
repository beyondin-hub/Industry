import Link from "next/link";
import {
  Truck,
  FileText,
  Download,
  CheckCircle2,
  Package,
  ClipboardCheck,
  MapPin,
  RotateCw,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrdenStatus } from "@/components/shared/status-badge";
import { ORDERS } from "@/lib/data/account";
import { getProvider } from "@/lib/data/providers";
import { mxn, fechaCorta } from "@/lib/utils";
import { categoriaNombre } from "@/lib/constants";
import type { EstadoOrden } from "@/types";

export const metadata = { title: "Órdenes" };

const PASOS: { estado: EstadoOrden; label: string; icon: any }[] = [
  { estado: "confirmada", label: "Confirmada", icon: ClipboardCheck },
  { estado: "en_preparacion", label: "En preparación", icon: Package },
  { estado: "en_transito", label: "En tránsito", icon: Truck },
  { estado: "entregada", label: "Entregada", icon: CheckCircle2 },
];

const ORDEN_IDX: Record<EstadoOrden, number> = {
  confirmada: 0,
  en_preparacion: 1,
  en_transito: 2,
  entregada: 3,
  cancelada: -1,
};

function Tracking({ estado }: { estado: EstadoOrden }) {
  const current = ORDEN_IDX[estado];
  return (
    <div className="flex items-center">
      {PASOS.map((paso, i) => {
        const done = i <= current;
        const Icon = paso.icon;
        return (
          <div key={paso.estado} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex size-9 items-center justify-center rounded-full ${
                  done ? "bg-safety text-white" : "bg-steel-100 text-steel-400"
                }`}
              >
                <Icon className="size-4" />
              </div>
              <span className={`text-[11px] ${done ? "font-medium text-steel-800" : "text-steel-400"}`}>
                {paso.label}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${i < current ? "bg-safety" : "bg-steel-100"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrdenesPage() {
  const enCurso = ORDERS.filter((o) => o.estado !== "entregada" && o.estado !== "cancelada");
  const historial = ORDERS.filter((o) => o.estado === "entregada" || o.estado === "cancelada");

  return (
    <div className="space-y-6">
      <PageHeader title="Órdenes" description="Seguimiento en vivo, CFDI y recompra en un clic" />

      {/* En curso con tracking */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-steel-500">En curso</h2>
        {enCurso.map((o) => {
          const prov = getProvider(o.provider_id);
          return (
            <Card key={o.id}>
              <CardContent className="space-y-5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-steel-900">{o.folio}</span>
                      <OrdenStatus estado={o.estado} />
                      {o.es_credito && <Badge variant="purplecow">Crédito {fechaCorta(o.fecha_vencimiento_credito!)}</Badge>}
                    </div>
                    <p className="mt-0.5 text-sm text-steel-500">
                      {categoriaNombre(o.categoria)} · {prov?.nombre_comercial} · {fechaCorta(o.created_at)}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-steel-950">{mxn(o.total)}</p>
                </div>
                <Tracking estado={o.estado} />
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {o.tracking_url && (
                    <Button variant="accent" size="sm">
                      <MapPin className="size-4" /> Rastrear envío
                    </Button>
                  )}
                  {o.cfdi_uuid && (
                    <Button variant="outline" size="sm">
                      <FileText className="size-4" /> CFDI
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de órdenes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b bg-steel-50 text-left text-xs text-steel-500">
                  <th className="px-5 py-3 font-medium">Folio</th>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 font-medium">Proveedor</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((o) => {
                  const prov = getProvider(o.provider_id);
                  return (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-steel-50">
                      <td className="px-5 py-3 font-semibold text-steel-900">{o.folio}</td>
                      <td className="px-5 py-3 text-steel-600">{categoriaNombre(o.categoria)}</td>
                      <td className="px-5 py-3 text-steel-600">{prov?.nombre_comercial}</td>
                      <td className="px-5 py-3 text-steel-600">{fechaCorta(o.created_at)}</td>
                      <td className="px-5 py-3"><OrdenStatus estado={o.estado} /></td>
                      <td className="px-5 py-3 text-right font-semibold text-steel-900">{mxn(o.total)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="ghost" size="sm" title="Descargar CFDI">
                            <Download className="size-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <RotateCw className="size-3.5" /> Recomprar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
