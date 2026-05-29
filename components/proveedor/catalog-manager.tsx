"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { mxn, num } from "@/lib/utils";
import type { Product } from "@/types";

interface Row {
  id: string;
  nombre: string;
  numero_parte: string;
  marca: string;
  precio_base: number;
  stock_actual: number;
  unidad: string;
}

const empty = (): Row => ({ id: "", nombre: "", numero_parte: "", marca: "", precio_base: 0, stock_actual: 0, unidad: "pza" });

export function CatalogManager({ initial }: { initial: Product[] }) {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>(
    initial.map((p) => ({
      id: p.id, nombre: p.nombre, numero_parte: p.numero_parte, marca: p.marca,
      precio_base: p.precio_base, stock_actual: p.stock_actual, unidad: p.unidad,
    })),
  );
  const [editing, setEditing] = useState<Row | null>(null);

  function save(row: Row) {
    if (row.nombre.trim().length < 3) {
      toast({ type: "error", title: "El nombre es muy corto" });
      return;
    }
    if (row.id) {
      setRows((a) => a.map((r) => (r.id === row.id ? row : r)));
      toast({ type: "success", title: "Producto actualizado", description: row.nombre });
    } else {
      setRows((a) => [{ ...row, id: `new-${Date.now()}` }, ...a]);
      toast({ type: "success", title: "Producto agregado", description: row.nombre });
    }
    setEditing(null);
  }

  function remove(id: string, nombre: string) {
    setRows((a) => a.filter((r) => r.id !== id));
    toast({ type: "info", title: "Producto eliminado", description: nombre });
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <p className="flex items-center gap-2 font-display font-semibold text-ink-900">
          <Package className="size-5 text-ink-600" /> Mi catálogo ({rows.length})
        </p>
        <Button variant="gradient" size="sm" onClick={() => setEditing(empty())}>
          <Plus className="size-4" /> Agregar producto
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b bg-secondary/50 text-left text-xs text-ink-500">
              <th className="px-5 py-3 font-medium">Producto</th>
              <th className="px-5 py-3 font-medium">N/P</th>
              <th className="px-5 py-3 text-right font-medium">Precio base</th>
              <th className="px-5 py-3 text-right font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-secondary/30">
                <td className="px-5 py-3 font-medium text-ink-900">{r.nombre}</td>
                <td className="px-5 py-3 font-mono text-ink-600">{r.numero_parte || "—"}</td>
                <td className="px-5 py-3 text-right font-semibold text-ink-900">{mxn(r.precio_base)}</td>
                <td className="px-5 py-3 text-right text-ink-600">{num(r.stock_actual)}</td>
                <td className="px-5 py-3">
                  <Badge variant={r.stock_actual > 0 ? "success" : "warning"}>{r.stock_actual > 0 ? "En stock" : "Sin stock"}</Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(r)} aria-label="Editar"><Pencil className="size-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(r.id, r.nombre)} aria-label="Eliminar"><Trash2 className="size-4 text-danger" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <EditModal row={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function EditModal({ row, onClose, onSave }: { row: Row; onClose: () => void; onSave: (r: Row) => void }) {
  const [draft, setDraft] = useState<Row>(row);
  const set = (patch: Partial<Row>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink-900">{row.id ? "Editar producto" : "Nuevo producto"}</h3>
          <button onClick={onClose} aria-label="Cerrar" className="text-ink-400 hover:text-ink-800"><X className="size-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="mb-1.5 block">Nombre</Label>
            <Input value={draft.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="Ej. Balero 6206-2RS" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Número de parte</Label>
              <Input value={draft.numero_parte} onChange={(e) => set({ numero_parte: e.target.value })} className="font-mono" />
            </div>
            <div>
              <Label className="mb-1.5 block">Marca</Label>
              <Input value={draft.marca} onChange={(e) => set({ marca: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="mb-1.5 block">Precio base</Label>
              <Input type="number" min={0} value={draft.precio_base} onChange={(e) => set({ precio_base: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Stock</Label>
              <Input type="number" min={0} value={draft.stock_actual} onChange={(e) => set({ stock_actual: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Unidad</Label>
              <Select value={draft.unidad} onChange={(e) => set({ unidad: e.target.value })}>
                <option value="pza">pza</option><option value="par">par</option><option value="caja">caja</option><option value="kit">kit</option><option value="galón">galón</option>
              </Select>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="gradient" onClick={() => onSave(draft)}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}
