import type { Company, Order } from "@/types";

// ────────────────────────────────────────────────────────────
// Motor de crédito de Novak.
// Novak otorga la línea a la maquiladora, paga al proveedor y cobra a la
// maquila. Este módulo calcula exposición/disponible y evalúa solicitudes.
// ────────────────────────────────────────────────────────────

export interface CreditProfile {
  limite: number;
  dias: number;
  usado: number;       // exposición vigente (órdenes a crédito sin pagar)
  disponible: number;
  utilizacionPct: number;
}

/** Exposición vigente: órdenes a crédito no pagadas ni canceladas. */
export function creditExposure(orders: Order[]): number {
  return orders
    .filter((o) => o.es_credito && !o.pagado && o.estado !== "cancelada")
    .reduce((s, o) => s + o.total, 0);
}

export function creditProfile(company: Company, orders: Order[]): CreditProfile {
  const usado = creditExposure(orders);
  const limite = company.limite_credito ?? 0;
  const disponible = Math.max(0, limite - usado);
  return {
    limite,
    dias: company.dias_credito ?? 0,
    usado,
    disponible,
    utilizacionPct: limite > 0 ? Math.round((usado / limite) * 100) : 0,
  };
}

/** ¿Alcanza la línea disponible para esta orden a crédito? */
export function canUseCredit(profile: CreditProfile, total: number): boolean {
  return profile.disponible >= total;
}

// ─── Scoring de solicitud de crédito (heurístico, determinista) ───
const RIESGO_INDUSTRIA: Record<string, number> = {
  automotriz: 0.95, aeroespacial: 0.95, medico: 0.92, electronica: 0.9,
  plasticos: 0.85, metalmecanica: 0.85, alimentos: 0.88,
};

export interface CreditDecisionInput {
  industria?: string;
  antiguedadMeses?: number; // antigüedad de la empresa en la plataforma/operando
  gmv6m?: number;           // compras últimos 6 meses
  limiteSolicitado?: number;
}
export interface CreditDecision {
  aprobado: boolean;
  score: number;          // 0-100
  limiteSugerido: number;
  dias: 0 | 30 | 60 | 90;
  razon: string;
}

export function evaluarCredito(input: CreditDecisionInput): CreditDecision {
  const factorInd = RIESGO_INDUSTRIA[input.industria ?? ""] ?? 0.8;
  const antig = Math.min(1, (input.antiguedadMeses ?? 6) / 24); // satura a 2 años
  const gmv = input.gmv6m ?? 0;
  const factorGmv = Math.min(1, gmv / 600_000);

  const score = Math.round((factorInd * 40 + antig * 25 + factorGmv * 35));

  // Límite sugerido: ~2 meses de compra, acotado por score.
  const base = Math.max(50_000, (gmv / 6) * 2);
  const limiteSugerido = Math.round((base * (0.5 + score / 200)) / 1000) * 1000;

  const dias: CreditDecision["dias"] = score >= 75 ? 90 : score >= 60 ? 60 : score >= 45 ? 30 : 0;
  const aprobado = score >= 45;

  return {
    aprobado,
    score,
    limiteSugerido: aprobado ? limiteSugerido : 0,
    dias,
    razon: aprobado
      ? `Aprobado: score ${score}/100. Línea sugerida ${dias} días.`
      : `Requiere revisión manual: score ${score}/100 (historial/volumen insuficiente).`,
  };
}

/** Desglose de una cotización: subtotal + comisión Novak + IVA. */
export const COMISION = 0.12;
export const IVA = 0.16;
export function desgloseCotizacion(subtotal: number, comisionPct = COMISION) {
  const comision = +(subtotal * comisionPct).toFixed(2);
  const base = subtotal + comision;
  const iva = +(base * IVA).toFixed(2);
  return { subtotal, comision, iva, total: +(base + iva).toFixed(2) };
}
