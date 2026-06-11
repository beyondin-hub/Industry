"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Clock, CheckCircle2, ClipboardList, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatalogStore } from "@/lib/catalog/store";
import { priceForQty } from "@/lib/catalog/signals";
import { mxn } from "@/lib/utils";
import type { Product } from "@/types";

type Pago = "contado" | "30" | "60";
type Urgencia = "normal" | "urgente_24h";

const PAGO_SURCHARGE: Record<Pago, number> = { contado: 0, "30": 0.015, "60": 0.03 };

export default function CotizacionPage() {
  const { cart, setCartQty, removeFromCart, clearCart } = useCatalogStore();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [pago, setPago] = useState<Pago>("contado");
  const [urgencia, setUrgencia] = useState<Urgencia>("normal");
  const [sending, setSending] = useState(false);
  const [folio, setFolio] = useState<string | null>(null);

  // Resolver detalles de los productos del carrito.
  useEffect(() => {
    const ids = cart.map((l) => l.id).filter((id) => !products[id]);
    if (ids.length === 0) return;
    fetch(`/api/catalogo/products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d: { products: Product[] }) => {
        setProducts((prev) => {
          const next = { ...prev };
          for (const p of d.products) next[p.id] = p;
          return next;
        });
      })
      .catch(() => {});
  }, [cart, products]);

  const lines = useMemo(
    () =>
      cart
        .map((l) => {
          const p = products[l.id];
          if (!p) return null;
          const { precio, pct } = priceForQty(p, l.cantidad);
          const unit = l.reorden ? precio * 0.95 : precio;
          return { line: l, product: p, unit, pct, subtotal: unit * l.cantidad };
        })
        .filter(Boolean) as {
        line: (typeof cart)[number];
        product: Product;
        unit: number;
        pct: number;
        subtotal: number;
      }[],
    [cart, products],
  );

  const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
  const recargo = subtotal * PAGO_SURCHARGE[pago];
  const iva = (subtotal + recargo) * 0.16;
  const total = subtotal + recargo + iva;

  async function enviar() {
    setSending(true);
    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urgencia,
          condicion_pago: pago,
          requiere_cfdi: true,
          notas: "Cotización generada desde el carrito de catálogo.",
          items: lines.map((l) => ({
            descripcion: l.product.nombre,
            numero_parte: l.product.numero_parte,
            cantidad: l.line.cantidad,
            unidad: l.product.unidad,
          })),
        }),
      });
      const data = await res.json();
      setFolio(data.folio ?? "NVK-RFQ");
      clearCart();
    } catch {
      setFolio("NVK-RFQ");
      clearCart();
    } finally {
      setSending(false);
    }
  }

  if (folio) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-7 text-emerald-600" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink-900">Tu cotización {folio} fue recibida</h1>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-ink-600">
          <Clock className="size-4" /> Confirmación en máximo 2 horas hábiles
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/catalogo"><Button variant="accent">Seguir comprando</Button></Link>
          <Link href="/cotizaciones"><Button variant="outline">Ver mis cotizaciones</Button></Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-10 text-center">
        <ClipboardList className="mx-auto size-10 text-steel-300" />
        <p className="mt-3 text-lg font-semibold text-ink-900">Tu cotización está vacía</p>
        <p className="mt-1 text-sm text-ink-500">Agrega productos del catálogo para cotizarlos juntos.</p>
        <Link href="/catalogo" className="mt-4 inline-block">
          <Button variant="accent">Explorar catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Mi Cotización</h1>
        <p className="mt-1 text-sm text-ink-600">
          {lines.length} productos · Total estimado {mxn(total)} con IVA ·{" "}
          <span className="text-ink-500">NOVAK confirma precios y disponibilidad en menos de 2 horas</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Líneas */}
        <div className="space-y-3">
          {lines.map(({ line, product, unit, pct, subtotal }) => (
            <div key={product.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <Link href={`/catalogo/${product.id}`} className="font-semibold text-ink-900 hover:underline">
                  {product.nombre}
                </Link>
                <p className="text-xs text-ink-500">{product.numero_parte} · {product.marca}</p>
                <p className="mt-1 text-xs text-emerald-600">
                  {mxn(unit)}/{product.unidad}{pct > 0 ? ` (−${pct}% por volumen)` : ""}
                  {line.reorden ? " · reorden auto −5%" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={line.cantidad}
                  onChange={(e) => setCartQty(product.id, Math.max(1, Number(e.target.value) || 1))}
                  className="h-9 w-20 rounded border border-input bg-card px-2 text-center text-sm"
                />
                <span className="w-24 text-right font-semibold text-ink-900">{mxn(subtotal)}</span>
                <button onClick={() => removeFromCart(product.id)} className="text-steel-400 hover:text-danger" aria-label="Quitar">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-4 rounded-xl border bg-card p-5">
            <p className="text-sm font-semibold text-ink-900">Resumen de cotización</p>
            <dl className="space-y-1.5 text-sm">
              <Row label="Subtotal (sin IVA)" value={mxn(subtotal)} />
              {recargo > 0 && <Row label={`Recargo crédito ${pago}d`} value={mxn(recargo)} />}
              <Row label="IVA (16%)" value={mxn(iva)} />
              <div className="border-t pt-1.5">
                <Row label="Total estimado" value={mxn(total)} bold />
              </div>
            </dl>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">Condición de pago</p>
              <div className="space-y-1">
                {([["contado", "Contado (precio base)"], ["30", "Crédito 30 días (+1.5%)"], ["60", "Crédito 60 días (+3.0%)"]] as const).map(([k, l]) => (
                  <label key={k} className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
                    <input type="radio" name="pago" checked={pago === k} onChange={() => setPago(k)} className="accent-safety" /> {l}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">Urgencia</p>
              <div className="space-y-1">
                {([["normal", "Normal — 24-48 horas"], ["urgente_24h", "Urgente — hoy (sobrecargo)"]] as const).map(([k, l]) => (
                  <label key={k} className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
                    <input type="radio" name="urg" checked={urgencia === k} onChange={() => setUrgencia(k)} className="accent-safety" /> {l}
                  </label>
                ))}
              </div>
            </div>

            <Button variant="accent" className="w-full" onClick={enviar} disabled={sending}>
              {sending ? <><Loader2 className="size-4 animate-spin" /> Enviando…</> : <>Enviar cotización →</>}
            </Button>
            <ul className="space-y-1 text-xs text-ink-500">
              <li className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-emerald-600" /> Confirmación en 2h hábiles</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-emerald-600" /> CFDI al aprobar · tracking en tiempo real</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-semibold text-ink-900" : "text-ink-600"}>{label}</dt>
      <dd className={bold ? "text-lg font-bold text-ink-900" : "font-medium text-ink-800"}>{value}</dd>
    </div>
  );
}
