"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, FileSpreadsheet, MessageCircle, Truck, AlertTriangle, Repeat, ClipboardList, Check, GitCompare, Bell } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mxn, precioPorCantidad, num } from "@/lib/utils";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { stockStatus, deliveryETA, socialProof } from "@/lib/catalog/signals";
import { useCatalogStore } from "@/lib/catalog/store";
import type { Product } from "@/types";

const STOCK_VARIANT = {
  success: "success",
  warning: "warning",
  danger: "danger",
  muted: "secondary",
} as const;

export function ProductBuyBox({ product }: { product: Product }) {
  const [cantidad, setCantidad] = useState(1);
  const [reorden, setReorden] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart, toggleCompare, toggleWatch, compare, watchlist } = useCatalogStore();
  const enCompare = compare.includes(product.id);
  const enWatch = watchlist.includes(product.id);
  const base = precioPorCantidad(product.price_tiers, product.precio_base, cantidad);
  const unit = reorden ? base * 0.95 : base; // -5% adicional por reorden automático
  const total = unit * cantidad;
  const ahorroUnit = product.precio_base - unit;
  const stock = stockStatus(product);
  const proof = socialProof(product);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-steel-950">{mxn(unit)}</span>
        <span className="text-sm text-steel-500">/{product.unidad}</span>
      </div>
      {ahorroUnit > 0 && (
        <p className="mt-1 text-sm text-emerald-600">
          Ahorras {mxn(ahorroUnit)}/{product.unidad} a esta cantidad
        </p>
      )}

      {/* Disponibilidad exacta + ETA */}
      <div className="mt-4 space-y-1.5">
        <Badge variant={STOCK_VARIANT[stock.tone]} className="text-[11px]">
          {stock.escaso ? <AlertTriangle className="size-3" /> : null} {stock.label}
        </Badge>
        <p className="flex items-center gap-1.5 text-xs text-steel-600">
          <Truck className="size-3.5 shrink-0" /> {deliveryETA(product)}
        </p>
        {proof && <p className="text-xs font-medium text-safety">{proof}</p>}
      </div>

      {/* Quantity */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm font-medium text-steel-700">Cantidad</span>
        <div className="flex items-center rounded-md border">
          <button
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="flex size-9 items-center justify-center text-steel-600 hover:bg-secondary"
            aria-label="Menos"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
            className="h-9 w-16 border-x text-center text-sm outline-none"
          />
          <button
            onClick={() => setCantidad((c) => c + 1)}
            className="flex size-9 items-center justify-center text-steel-600 hover:bg-secondary"
            aria-label="Más"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <span className="text-sm text-steel-500">{product.unidad}</span>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-steel-50 px-4 py-3">
        <span className="text-sm font-medium text-steel-600">Total estimado</span>
        <span className="text-xl font-bold text-steel-950">{mxn(total)}</span>
      </div>

      {/* Reorden automático con descuento adicional */}
      <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm">
        <input
          type="checkbox"
          checked={reorden}
          onChange={(e) => setReorden(e.target.checked)}
          className="mt-0.5 size-4 accent-safety"
        />
        <span>
          <span className="flex items-center gap-1.5 font-medium text-steel-800">
            <Repeat className="size-3.5" /> Reorden automático cada 30 días
          </span>
          <span className="text-xs text-emerald-600">+5% de descuento adicional en cada entrega</span>
        </span>
      </label>

      <div className="mt-4 space-y-2">
        <Button
          variant="accent"
          size="lg"
          className="w-full"
          onClick={() => {
            addToCart(product.id, cantidad, reorden);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
        >
          {added ? <><Check className="size-4" /> Agregado a tu cotización</> : <><ClipboardList className="size-4" /> Agregar a cotización</>}
        </Button>
        {added && (
          <Link href="/cotizacion" className="block text-center text-sm font-medium text-safety hover:underline">
            Ver mi cotización →
          </Link>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => toggleCompare(product.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-medium transition-colors",
              enCompare ? "border-safety bg-safety-50 text-safety" : "text-steel-600 hover:bg-secondary",
            )}
          >
            <GitCompare className="size-3.5" /> {enCompare ? "Comparando" : "Comparar"}
          </button>
          <button
            onClick={() => toggleWatch(product.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-medium transition-colors",
              enWatch ? "border-safety bg-safety-50 text-safety" : "text-steel-600 hover:bg-secondary",
            )}
          >
            <Bell className="size-3.5" /> {enWatch ? "En watchlist" : "Avisarme"}
          </button>
        </div>
        <Link
          href={`/cotizar?sku=${product.id}&qty=${cantidad}${reorden ? "&reorden=1" : ""}`}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
        >
          <FileSpreadsheet className="size-4" /> Cotización formal (RFQ)
        </Link>
        <a
          href={BRAND.whatsappLink}
          className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "w-full text-emerald-700")}
        >
          <MessageCircle className="size-4" /> Cotizar por WhatsApp
        </a>
      </div>

      {/* Price tiers (Uline/Amazon Business) */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-steel-700">Precios por volumen</p>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-steel-50 text-left text-xs text-steel-500">
                <th className="px-3 py-2 font-medium">Cantidad</th>
                <th className="px-3 py-2 text-right font-medium">Precio unitario</th>
              </tr>
            </thead>
            <tbody>
              {product.price_tiers.map((t, i) => {
                const active = cantidad >= t.cantidad_minima &&
                  (i === product.price_tiers.length - 1 ||
                    cantidad < product.price_tiers[i + 1].cantidad_minima);
                return (
                  <tr key={t.cantidad_minima} className={cn("border-t", active && "bg-safety-50")}>
                    <td className="px-3 py-2">
                      {num(t.cantidad_minima)}+ {active && <Badge variant="accent" className="ml-1 text-[10px]">actual</Badge>}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">{mxn(t.precio)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
