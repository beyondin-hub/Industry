"use client";

import { Fragment, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Lock, Unlock, Settings2, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { mxn, fechaCorta } from "@/lib/utils";
import { registrarMovimiento } from "@/app/(admin)/admin/bodega/actions";
import type { InventoryItem, Movement, MovimientoTipo } from "@/lib/data/warehouse";

const TIPO_META: Record<MovimientoTipo, { label: string; icon: any; variant: any }> = {
  entrada: { label: "Entrada", icon: ArrowDownToLine, variant: "success" },
  salida: { label: "Salida", icon: ArrowUpFromLine, variant: "warning" },
  reserva: { label: "Reserva", icon: Lock, variant: "purplecow" },
  liberacion: { label: "Liberación", icon: Unlock, variant: "secondary" },
  ajuste: { label: "Ajuste", icon: Settings2, variant: "secondary" },
};

export function WarehouseManager({ inventory, movements }: { inventory: InventoryItem[]; movements: Movement[] }) {
  const { toast } = useToast();
  const [tab, setTab] = useState<"inventario" | "movimientos">("inventario");
  const [items, setItems] = useState(inventory);
  const [log, setLog] = useState(movements);
  const [editing, setEditing] = useState<string | null>(null);
  const [tipo, setTipo] = useState<MovimientoTipo>("entrada");
  const [cantidad, setCantidad] = useState("");
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);

  function aplicarLocal(it: InventoryItem, t: MovimientoTipo, c: number): InventoryItem {
    let { stock, reservado } = it;
    if (t === "entrada") stock += c;
    else if (t === "salida") stock = Math.max(0, stock - c);
    else if (t === "reserva") reservado += c;
    else if (t === "liberacion") reservado = Math.max(0, reservado - c);
    else if (t === "ajuste") stock = c;
    const disponible = Math.max(0, stock - reservado);
    return { ...it, stock, reservado, disponible, bajo_minimo: disponible <= it.stock_minimo };
  }

  async function guardar(it: InventoryItem) {
    const c = Number(cantidad);
    if (!c || c <= 0) {
      toast({ type: "error", title: "Cantidad inválida" });
      return;
    }
    setBusy(true);
    try {
      const res = await registrarMovimiento({ inventoryId: it.id, sku: it.sku, tipo, cantidad: c, referencia: ref || undefined });
      if (!res.ok) throw new Error(res.error);
      const updated = aplicarLocal(it, tipo, c);
      setItems((prev) => prev.map((x) => (x.id === it.id ? updated : x)));
      setLog((prev) => [
        {
          id: `mov-${Date.now()}`,
          inventory_id: it.id,
          sku: it.sku,
          nombre: it.nombre,
          tipo,
          cantidad: c,
          saldo: updated.stock,
          referencia: ref || (tipo === "entrada" ? "Recibo proveedor" : "—"),
          usuario: "Equipo Novak",
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      toast({ type: "success", title: `${TIPO_META[tipo].label} registrada`, description: `${it.sku} · ${c} u` });
      setEditing(null);
      setCantidad("");
      setRef("");
    } catch (e: any) {
      toast({ type: "error", title: "No se pudo registrar", description: e?.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex gap-1 border-b p-3">
          {(["inventario", "movimientos"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-ink-950 text-white" : "text-ink-500 hover:bg-secondary/50"
              }`}
            >
              {t === "inventario" ? `Inventario (${items.length})` : `Movimientos (${log.length})`}
            </button>
          ))}
        </div>

        {tab === "inventario" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/40 text-left text-xs text-ink-500">
                  <th className="px-4 py-3 font-medium">SKU / Producto</th>
                  <th className="px-4 py-3 font-medium">Ubicación</th>
                  <th className="px-4 py-3 text-right font-medium">Stock</th>
                  <th className="px-4 py-3 text-right font-medium">Reservado</th>
                  <th className="px-4 py-3 text-right font-medium">Disponible</th>
                  <th className="px-4 py-3 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <Fragment key={it.id}>
                    <tr className="border-b last:border-0 hover:bg-secondary/20">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold text-ink-900">{it.sku}</div>
                        <div className="max-w-[260px] truncate text-xs text-ink-500">{it.nombre}</div>
                        <div className="text-[11px] text-ink-400">{it.proveedor}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-600">{it.ubicacion}</td>
                      <td className="px-4 py-3 text-right font-medium text-ink-800">{it.stock}</td>
                      <td className="px-4 py-3 text-right text-ink-600">{it.reservado}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${it.bajo_minimo ? "text-danger" : "text-emerald-600"}`}>{it.disponible}</span>
                        {it.bajo_minimo && (
                          <Badge variant="danger" className="ml-2">
                            Bajo mín.
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => { setEditing(editing === it.id ? null : it.id); setTipo("entrada"); }}>
                          Movimiento
                        </Button>
                      </td>
                    </tr>
                    {editing === it.id && (
                      <tr className="bg-secondary/30">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="flex flex-wrap items-end gap-2">
                            <div className="flex gap-1">
                              {(Object.keys(TIPO_META) as MovimientoTipo[]).map((t) => (
                                <button
                                  key={t}
                                  onClick={() => setTipo(t)}
                                  className={`rounded-md border px-2 py-1.5 text-xs font-medium ${
                                    tipo === t ? "border-safety bg-safety/10 text-safety" : "border-input text-ink-500 hover:bg-paper-100"
                                  }`}
                                >
                                  {TIPO_META[t].label}
                                </button>
                              ))}
                            </div>
                            <Input
                              type="number"
                              min="1"
                              placeholder={tipo === "ajuste" ? "Nuevo stock" : "Cantidad"}
                              value={cantidad}
                              onChange={(e) => setCantidad(e.target.value)}
                              className="w-32"
                            />
                            <Input placeholder="Referencia (folio/nota)" value={ref} onChange={(e) => setRef(e.target.value)} className="w-48" />
                            <Button variant="accent" size="sm" disabled={busy} onClick={() => guardar(it)}>
                              {busy ? <Loader2 className="size-4 animate-spin" /> : null} Registrar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                              <X className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="divide-y">
            {log.map((m) => {
              const meta = TIPO_META[m.tipo];
              const Icon = meta.icon;
              return (
                <div key={m.id} className="flex items-center gap-3 p-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-ink-600">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      <span className="font-mono text-xs font-semibold text-ink-900">{m.sku}</span>
                    </div>
                    <p className="truncate text-xs text-ink-500">{m.nombre} · {m.referencia}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ink-800">{m.cantidad} u</p>
                    <p className="text-[11px] text-ink-400">{fechaCorta(m.created_at)} · saldo {m.saldo}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
