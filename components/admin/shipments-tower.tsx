"use client";

import { useState } from "react";
import { Loader2, FileText, MapPin, Warehouse, Truck, PackageCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { zonaLabel } from "@/lib/logistics/zones";
import { cn } from "@/lib/utils";
import { updateShipmentStatus, generateGuide } from "@/app/(admin)/admin/envios/actions";
import type { Shipment, ShipmentEstado } from "@/lib/data/shipments";

const MODO_BADGE: Record<string, { v: any; icon: any }> = {
  fulfillment_tj: { v: "success", icon: Warehouse },
  dropshipping: { v: "accent", icon: Truck },
  entrega_directa: { v: "steel", icon: PackageCheck },
};
const ESTADO_VAR: Record<string, any> = { creado: "secondary", recolectado: "warning", en_transito: "accent", entregado: "success", incidencia: "danger" };
const ESTADOS: ShipmentEstado[] = ["creado", "recolectado", "en_transito", "entregado", "incidencia"];

export function ShipmentsTower({ shipments }: { shipments: Shipment[] }) {
  const { toast } = useToast();
  const [rows, setRows] = useState(shipments);
  const [modo, setModo] = useState("todos");
  const [estado, setEstado] = useState("todos");
  const [busy, setBusy] = useState<string | null>(null);

  const visibles = rows.filter((s) => (modo === "todos" || s.modo === modo) && (estado === "todos" || s.estado === estado));

  async function cambiar(s: Shipment, e: ShipmentEstado) {
    setRows((a) => a.map((x) => (x.id === s.id ? { ...x, estado: e } : x)));
    await updateShipmentStatus({ shipmentId: s.id, folio: s.folio, estado: e });
    toast({ type: "success", title: `${s.folio} → ${e.replace("_", " ")}` });
  }
  async function guia(s: Shipment) {
    setBusy(s.id);
    const res = await generateGuide({ shipmentId: s.id, folio: s.folio });
    setBusy(null);
    if (res.ok) { setRows((a) => a.map((x) => (x.id === s.id ? { ...x, guia: res.guia! } : x))); toast({ type: "success", title: "Guía + Carta Porte generadas", description: res.guia }); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={modo} onChange={(e) => setModo(e.target.value)} className="h-9 w-52">
          <option value="todos">Todos los modos</option>
          <option value="fulfillment_tj">Fulfillment Tijuana</option>
          <option value="dropshipping">Dropshipping</option>
          <option value="entrega_directa">Entrega directa</option>
        </Select>
        <Select value={estado} onChange={(e) => setEstado(e.target.value)} className="h-9 w-44">
          <option value="todos">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e.replace("_", " ")}</option>)}
        </Select>
        <span className="ml-auto text-sm text-ink-500">{visibles.length} envíos</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left text-xs text-ink-500">
                  <th className="px-5 py-3 font-medium">Orden / destino</th>
                  <th className="px-5 py-3 font-medium">Proveedor</th>
                  <th className="px-5 py-3 font-medium">Modo</th>
                  <th className="px-5 py-3 font-medium">Carrier / guía</th>
                  <th className="px-5 py-3 font-medium">ETA</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((s) => {
                  const m = MODO_BADGE[s.modo];
                  const Icon = m.icon;
                  const dias = Math.ceil(s.eta_horas / 24);
                  return (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-secondary/30">
                      <td className="px-5 py-3">
                        <p className="font-mono font-semibold text-ink-900">{s.folio}</p>
                        <p className="flex items-center gap-1 text-[11px] text-ink-500"><MapPin className="size-3" /> {s.destino} · {zonaLabel(s.zona as any)}</p>
                      </td>
                      <td className="px-5 py-3 text-ink-700">{s.proveedor}</td>
                      <td className="px-5 py-3"><Badge variant={m.v}><Icon className="size-3" /> {s.modoLabel}</Badge></td>
                      <td className="px-5 py-3">
                        <p className="text-ink-700">{s.carrier}</p>
                        <p className="font-mono text-[11px] text-ink-400">{s.guia}</p>
                      </td>
                      <td className="px-5 py-3 text-ink-600">{s.eta_horas <= 24 ? "24h" : s.eta_horas <= 48 ? "24-48h" : `${dias} días`}</td>
                      <td className="px-5 py-3">
                        <Select value={s.estado} onChange={(e) => cambiar(s, e.target.value as ShipmentEstado)} className="h-8 w-36">
                          {ESTADOS.map((e) => <option key={e} value={e}>{e.replace("_", " ")}</option>)}
                        </Select>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button variant="outline" size="sm" disabled={busy === s.id} onClick={() => guia(s)}>
                          {busy === s.id ? <Loader2 className="size-4 animate-spin" /> : <><FileText className="size-3.5" /> Guía + Carta Porte</>}
                        </Button>
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
