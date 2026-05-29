import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un número como moneda MXN. */
export function mxn(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

/** Formatea cantidades enteras con separador de miles. */
export function num(value: number): string {
  return new Intl.NumberFormat("es-MX").format(value);
}

/** Formato corto de fecha en español. */
export function fechaCorta(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Formato fecha + hora. */
export function fechaHora(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Tiempo restante legible respecto a ahora ("1h 45m", "vencido"). */
export function tiempoRestante(iso: string): { label: string; vencido: boolean } {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { label: "Vencido", vencido: true };
  const horas = Math.floor(diff / 3_600_000);
  const minutos = Math.floor((diff % 3_600_000) / 60_000);
  if (horas > 24) return { label: `${Math.floor(horas / 24)}d ${horas % 24}h`, vencido: false };
  return { label: `${horas}h ${minutos}m`, vencido: false };
}

/** Convierte horas de entrega en etiqueta amigable. */
export function entregaLabel(horas: number, ciudad?: string): string {
  if (horas <= 24) return `Entrega mañana${ciudad ? ` en ${ciudad}` : ""}`;
  if (horas <= 48) return "Entrega 24-48h";
  const dias = Math.ceil(horas / 24);
  return `Entrega en ${dias} días`;
}

/** Comisión del broker Novak (8-15% según categoría/volumen). */
export const COMISION_DEFAULT = 0.12;
export const IVA = 0.16;

export function desglosePrecio(subtotal: number, comisionPct = COMISION_DEFAULT) {
  const comision = subtotal * comisionPct;
  const base = subtotal + comision;
  const iva = base * IVA;
  return {
    subtotal,
    comision,
    iva,
    total: base + iva,
  };
}

/** Precio unitario según tabla de price tiers y cantidad. */
export function precioPorCantidad(
  tiers: { cantidad_minima: number; precio: number }[],
  base: number,
  cantidad: number,
): number {
  const aplicables = [...tiers]
    .sort((a, b) => b.cantidad_minima - a.cantidad_minima)
    .find((t) => cantidad >= t.cantidad_minima);
  return aplicables ? aplicables.precio : base;
}

/** Genera folio legible tipo MRO-2026-0001. */
export function folio(prefijo: string, n: number): string {
  return `${prefijo}-2026-${String(n).padStart(4, "0")}`;
}
