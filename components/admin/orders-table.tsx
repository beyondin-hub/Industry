"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { OrdenStatus } from "@/components/shared/status-badge";
import { mxn, fechaCorta, cn } from "@/lib/utils";
import { updateOrderStatus } from "@/app/(admin)/admin/ordenes/actions";
import type { EstadoOrden } from "@/types";

export interface OrderVM {
  id: string; folio: string; empresa: string; proveedor: string; categoria: string;
  total: number; estado: EstadoOrden; es_credito: boolean; pagado: boolean; created_at: string;
}

const FILTROS: { k: string; label: string }[] = [
  { k: "todas", label: "Todas" },
  { k: "confirmada", label: "Confirmadas" },
  { k: "en_preparacion", label: "En preparación" },
  { k: "en_transito", label: "En tránsito" },
  { k: "entregada", label: "Entregadas" },
];
const ESTADOS: EstadoOrden[] = ["confirmada", "en_preparacion", "en_transito", "entregada", "cancelada"];

export function OrdersTable({ orders }: { orders: OrderVM[] }) {
  const { toast } = useToast();
  const [rows, setRows] = useState(orders);
  const [filtro, setFiltro] = useState("todas");
  const [busy, setBusy] = useState<string | null>(null);

  const visibles = filtro === "todas" ? rows : rows.filter((o) => o.estado === filtro);

  async function cambiar(o: OrderVM, estado: EstadoOrden) {
    setBusy(o.id);
    const res = await updateOrderStatus({ orderId: o.id, folio: o.folio, estado });
    setBusy(null);
    if (res.ok) {
      setRows((a) => a.map((x) => (x.id === o.id ? { ...x, estado } : x)));
      toast({ type: "success", title: `${o.folio} → ${estado.replace("_", " ")}` });
    } else toast({ type: "error", title: "No se pudo", description: res.error });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button key={f.k} onClick={() => setFiltro(f.k)}
            className={cn("rounded-full px-3 py-1 text-sm font-medium", filtro === f.k ? "bg-ink-950 text-white" : "border text-ink-600 hover:bg-secondary")}>
            {f.label}
          </button>
        ))}
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left text-xs text-ink-500">
                  <th className="px-5 py-3 font-medium">Folio</th>
                  <th className="px-5 py-3 font-medium">Comprador</th>
                  <th className="px-5 py-3 font-medium">Proveedor</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Pago</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 text-right font-medium">Cambiar estado</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-secondary/30">
                    <td className="px-5 py-3">
                      <p className="font-mono font-semibold text-ink-900">{o.folio}</p>
                      <p className="text-[11px] text-ink-400">{fechaCorta(o.created_at)}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{o.empresa}</td>
                    <td className="px-5 py-3 text-ink-700">{o.proveedor}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink-900">{mxn(o.total)}</td>
                    <td className="px-5 py-3">
                      {o.es_credito ? <Badge variant={o.pagado ? "success" : "warning"}>{o.pagado ? "Crédito pagado" : "A crédito"}</Badge> : <Badge variant="steel">Contado</Badge>}
                    </td>
                    <td className="px-5 py-3"><OrdenStatus estado={o.estado} /></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {busy === o.id && <Loader2 className="size-4 animate-spin text-ink-400" />}
                        <Select value={o.estado} onChange={(e) => cambiar(o, e.target.value as EstadoOrden)} className="h-8 w-40">
                          {ESTADOS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibles.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-ink-500">Sin órdenes en este filtro.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
