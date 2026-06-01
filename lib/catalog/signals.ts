// ────────────────────────────────────────────────────────────
// Novak — Señales de conversión del catálogo
// Funciones puras sobre Product: urgencia de stock, ETA exacto y
// precio por volumen. Reutilizables en tarjeta, SERP y PDP.
// ────────────────────────────────────────────────────────────
import type { Product } from "@/types";

export type StockTone = "success" | "warning" | "danger" | "muted";

export interface StockStatus {
  tone: StockTone;
  label: string;
  /** true si conviene transmitir escasez (pocas unidades). */
  escaso: boolean;
}

/** Badge de disponibilidad basado en el stock exacto en Tijuana. */
export function stockStatus(p: Product): StockStatus {
  const n = p.stock_actual ?? 0;
  if (n > 100) return { tone: "success", label: "En stock · Tijuana", escaso: false };
  if (n > 50) return { tone: "success", label: `${n} unidades en TJ`, escaso: false };
  if (n > 10) return { tone: "warning", label: `Pocas unidades · solo ${n} en TJ`, escaso: true };
  if (n >= 1) return { tone: "danger", label: `¡Últimas ${n} unidades!`, escaso: true };
  return { tone: "muted", label: "Bajo pedido · cotizar ETA", escaso: false };
}

/**
 * ETA exacto al estilo Amazon. Corte 14:00 (2 PM) hora Tijuana.
 * Usa el stock local; si no hay, cae a entrega nacional / bajo pedido.
 */
export function deliveryETA(p: Product, now: Date = new Date()): string {
  const hora = now.getHours();
  const enTJ = (p.stock_actual ?? 0) > 0;
  if (enTJ && hora < 14) return "Entrega mañana antes de 10 AM · pide antes de las 2 PM";
  if (enTJ) return "Entrega pasado mañana · ordena hoy para procesar";
  return "Entrega 2-3 días desde CEDIS nacional";
}

export interface VolumeBreak {
  cantidad: number;
  precio: number;
  pct: number;
}

/** Primer salto de precio por volumen (para mostrar en tarjeta/SERP). */
export function firstVolumeBreak(p: Product): VolumeBreak | null {
  const tiers = (p.price_tiers ?? [])
    .filter((t) => t.cantidad_minima > 1)
    .sort((a, b) => a.cantidad_minima - b.cantidad_minima);
  const t = tiers[0];
  if (!t || !p.precio_base) return null;
  const pct = Math.round((1 - t.precio / p.precio_base) * 100);
  if (pct <= 0) return null;
  return { cantidad: t.cantidad_minima, precio: t.precio, pct };
}

/** Precio unitario para una cantidad dada según los tiers (server-safe). */
export function priceForQty(p: Product, qty: number): { precio: number; pct: number } {
  const tiers = [{ cantidad_minima: 1, precio: p.precio_base }, ...(p.price_tiers ?? [])]
    .filter((t) => typeof t.precio === "number")
    .sort((a, b) => a.cantidad_minima - b.cantidad_minima);
  let precio = p.precio_base;
  for (const t of tiers) if (qty >= t.cantidad_minima) precio = t.precio;
  const pct = p.precio_base ? Math.round((1 - precio / p.precio_base) * 100) : 0;
  return { precio, pct };
}

/**
 * Social proof determinístico (demo): deriva una señal estable del id para
 * no inventar números distintos en cada render. En producción vendría de
 * product_metrics.
 */
export function socialProof(p: Product): string | null {
  const h = p.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  if (h % 5 === 0) return `🔥 #1 más pedido en ${p.categoria}`;
  if (h % 5 === 1) return `${8 + (h % 30)} maquiladoras en TJ lo piden este mes`;
  if (h % 5 === 2) return `Reordenado por ${3 + (h % 12)} empresas este trimestre`;
  return null;
}
