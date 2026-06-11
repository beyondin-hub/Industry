// ────────────────────────────────────────────────────────────
// Novak — Punto de entrada de paquetería + selector de carrier.
// getShippingProvider() devuelve el adaptador activo (hoy EnvíaYa).
// selectOptimalCarrier() aplica la política Novak sobre las tarifas.
// ────────────────────────────────────────────────────────────

import { enviaYaProvider } from "@/lib/enviaya/client";
import type { CarrierRate, ShippingProvider } from "@/lib/shipping/provider";

export * from "@/lib/shipping/provider";

/** Adaptador activo. Cambiar aquí para migrar de agregador sin tocar la app. */
export function getShippingProvider(): ShippingProvider {
  return enviaYaProvider;
}

export type CarrierPolicy = "barato" | "rapido" | "balanceado";

/**
 * Política Novak de selección de tarifa óptima:
 *  - barato: menor costo.
 *  - rapido: menor ETA (desempata por costo).
 *  - balanceado: mejor score = normaliza costo y ETA al 50/50.
 * Si es urgente, fuerza "rapido".
 */
export function selectOptimalCarrier(
  rates: CarrierRate[],
  opts: { policy?: CarrierPolicy; urgente?: boolean } = {},
): CarrierRate | null {
  if (!rates.length) return null;
  const policy: CarrierPolicy = opts.urgente ? "rapido" : opts.policy ?? "balanceado";

  if (policy === "barato") {
    return [...rates].sort((a, b) => a.costo - b.costo)[0];
  }
  if (policy === "rapido") {
    return [...rates].sort((a, b) => a.eta_horas - b.eta_horas || a.costo - b.costo)[0];
  }
  // balanceado: score 0..1 (menor = mejor) sobre costo y ETA normalizados.
  const minC = Math.min(...rates.map((r) => r.costo));
  const maxC = Math.max(...rates.map((r) => r.costo));
  const minE = Math.min(...rates.map((r) => r.eta_horas));
  const maxE = Math.max(...rates.map((r) => r.eta_horas));
  const norm = (v: number, lo: number, hi: number) => (hi === lo ? 0 : (v - lo) / (hi - lo));
  const scored = rates.map((r) => ({
    rate: r,
    score: 0.5 * norm(r.costo, minC, maxC) + 0.5 * norm(r.eta_horas, minE, maxE),
  }));
  return scored.sort((a, b) => a.score - b.score)[0].rate;
}

/** Marca la tarifa óptima como recomendada (para la UI de comparación). */
export function withRecommended(rates: CarrierRate[], opts: { policy?: CarrierPolicy; urgente?: boolean } = {}): CarrierRate[] {
  const best = selectOptimalCarrier(rates, opts);
  return rates.map((r) => ({ ...r, recomendado: r.id === best?.id }));
}
