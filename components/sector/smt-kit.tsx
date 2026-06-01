"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Zap, Plus, Trash2, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { mxn } from "@/lib/utils";
import type { SectorProduct } from "@/types";

interface LineItem {
  product: SectorProduct;
  porPeriodo: number;
  stockMinimo: number;
  reorden: boolean;
}

export function SmtKit({ color, products }: { color: string; products: SectorProduct[] }) {
  // Consumibles sugeridos para una línea SMT (semilla inicial editable).
  const seedIds = ["elec-ipa-99", "elec-sqg-met-12", "elec-kap-12mm", "elec-wip-lnf"];
  const [items, setItems] = useState<LineItem[]>(() =>
    products
      .filter((p) => seedIds.includes(p.id))
      .map((product) => ({ product, porPeriodo: 4, stockMinimo: 2, reorden: true })),
  );
  const [addId, setAddId] = useState("");

  const available = products.filter((p) => !items.some((i) => i.product.id === p.id));

  const update = (id: string, patch: Partial<LineItem>) =>
    setItems((arr) => arr.map((i) => (i.product.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => setItems((arr) => arr.filter((i) => i.product.id !== id));
  const add = () => {
    const p = products.find((x) => x.id === addId);
    if (!p) return;
    setItems((arr) => [...arr, { product: p, porPeriodo: 4, stockMinimo: 2, reorden: true }]);
    setAddId("");
  };

  // Alertas demo: las que tienen reorden activo generan recordatorio.
  const alerts = useMemo(
    () =>
      items
        .filter((i) => i.reorden)
        .slice(0, 2)
        .map((i) => ({
          id: i.product.id,
          text: `${i.product.nombre} — según tu consumo (${i.porPeriodo}/mes) conviene reordenar esta semana.`,
        })),
    [items],
  );

  const total = items.reduce((s, i) => s + i.product.precio * i.porPeriodo, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="rounded-2xl border-l-[3px] p-5" style={{ borderLeftColor: color, backgroundColor: `${color}14` }}>
        <h1 className="flex items-center gap-2 text-xl font-bold" style={{ color }}>
          <Zap className="size-5" /> Kit de Línea SMT
        </h1>
        <p className="mt-1 text-sm text-ink-600">Configura tu línea una vez. Nosotros la mantenemos.</p>
      </header>

      {/* Alertas */}
      {alerts.length > 0 && (
        <section className="space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {a.text}
            </div>
          ))}
        </section>
      )}

      {/* Configuración de línea */}
      <section className="rounded-xl border bg-card p-5">
        <p className="mb-3 text-sm font-semibold text-ink-900">Mi configuración de línea</p>
        <div className="space-y-2">
          {items.map((i) => (
            <div key={i.product.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">{i.product.nombre}</p>
                  <p className="text-xs text-ink-500">{i.product.sku} · {mxn(i.product.precio)}/{i.product.unidad}</p>
                </div>
                <button onClick={() => remove(i.product.id)} className="text-ink-400 hover:text-danger" aria-label="Quitar">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="Cantidad / mes">
                  <input type="number" min={1} value={i.porPeriodo}
                    onChange={(e) => update(i.product.id, { porPeriodo: Math.max(1, Number(e.target.value)) })}
                    className="h-8 w-full rounded border border-input bg-card px-2 text-sm" />
                </Field>
                <Field label="Stock mínimo">
                  <input type="number" min={0} value={i.stockMinimo}
                    onChange={(e) => update(i.product.id, { stockMinimo: Math.max(0, Number(e.target.value)) })}
                    className="h-8 w-full rounded border border-input bg-card px-2 text-sm" />
                </Field>
                <Field label="Reorden auto">
                  <label className="flex h-8 items-center gap-2 text-xs text-ink-600">
                    <input type="checkbox" checked={i.reorden}
                      onChange={(e) => update(i.product.id, { reorden: e.target.checked })}
                      className="size-4" style={{ accentColor: color }} />
                    {i.reorden ? "Activo" : "Inactivo"}
                  </label>
                </Field>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-500">Tu línea no tiene consumibles configurados.</p>
          )}
        </div>

        {/* Agregar consumible */}
        {available.length > 0 && (
          <div className="mt-4 flex gap-2 border-t pt-4">
            <select value={addId} onChange={(e) => setAddId(e.target.value)}
              className="h-9 flex-1 rounded-md border border-input bg-card px-2 text-sm">
              <option value="">Agregar consumible a mi línea…</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            <Button variant="outline" onClick={add} disabled={!addId}>
              <Plus className="size-4" /> Agregar
            </Button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-5">
        <div>
          <p className="text-sm text-ink-600">Consumo mensual estimado</p>
          <p className="text-xl font-bold text-ink-900">{mxn(total)}</p>
        </div>
        <Link
          href="/cotizar?kit=smt"
          className={buttonVariants({ variant: "accent" })}
        >
          <FileSpreadsheet className="size-4" /> Generar cotización de mis consumibles
        </Link>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
      {children}
    </div>
  );
}
