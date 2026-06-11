// ────────────────────────────────────────────────────────────
// Novak — Motor de scoring de proveedores (0–10).
// Pondera cumplimiento de la promesa Novak: rapidez de cotización (2h),
// fill rate, SLA de despacho y calidad. Define consecuencias automáticas:
//  - score < 7 → flag de observación
//  - score < 6 → reducir visibilidad en el catálogo
//  - score < 5 → suspender (no recibe nuevas asignaciones)
// ────────────────────────────────────────────────────────────

export interface ProviderMetrics {
  rfqsAsignados: number;
  cotizacionesATiempo: number; // cotizó dentro de 2h hábiles
  cotizacionesTotal: number;
  ordenesSurtidas: number;
  ordenesAsignadas: number;
  despachosATiempo: number; // confirmó despacho antes del deadline
  despachosTotal: number;
  incidencias: number; // entregas con problema / devolución
  entregas: number;
}

export type ScoreNivel = "elite" | "bueno" | "observacion" | "riesgo" | "critico";
export type ScoreConsecuencia = "ninguna" | "flag" | "reducir_visibilidad" | "suspender";

export interface ScoreComponente {
  clave: string;
  label: string;
  rate: number; // 0..1
  peso: number; // 0..1
  puntos: number; // rate * peso * 10
}

export interface ScoreBreakdown {
  score: number; // 0..10 (1 decimal)
  nivel: ScoreNivel;
  consecuencia: ScoreConsecuencia;
  componentes: ScoreComponente[];
  acciones: string[];
}

const PESOS = {
  cotizacion: 0.3, // promesa de 2h
  fill: 0.25,
  despacho: 0.25,
  calidad: 0.2,
} as const;

function rate(num: number, den: number, fallback = 1): number {
  if (den <= 0) return fallback; // sin historial: no penaliza
  return Math.max(0, Math.min(1, num / den));
}

export function scoreProvider(m: ProviderMetrics): ScoreBreakdown {
  const rCot = rate(m.cotizacionesATiempo, m.cotizacionesTotal);
  const rFill = rate(m.ordenesSurtidas, m.ordenesAsignadas);
  const rDesp = rate(m.despachosATiempo, m.despachosTotal);
  const rCal = rate(m.entregas - m.incidencias, m.entregas);

  const componentes: ScoreComponente[] = [
    { clave: "cotizacion", label: "Cotización en 2h hábiles", rate: rCot, peso: PESOS.cotizacion, puntos: rCot * PESOS.cotizacion * 10 },
    { clave: "fill", label: "Fill rate (órdenes surtidas)", rate: rFill, peso: PESOS.fill, puntos: rFill * PESOS.fill * 10 },
    { clave: "despacho", label: "SLA de despacho a tiempo", rate: rDesp, peso: PESOS.despacho, puntos: rDesp * PESOS.despacho * 10 },
    { clave: "calidad", label: "Calidad (sin incidencias)", rate: rCal, peso: PESOS.calidad, puntos: rCal * PESOS.calidad * 10 },
  ];

  const score = Math.round(componentes.reduce((a, c) => a + c.puntos, 0) * 10) / 10;
  const { nivel, consecuencia } = clasificar(score);
  const acciones = accionesDe(consecuencia, componentes);

  return { score, nivel, consecuencia, componentes, acciones };
}

function clasificar(score: number): { nivel: ScoreNivel; consecuencia: ScoreConsecuencia } {
  if (score >= 9) return { nivel: "elite", consecuencia: "ninguna" };
  if (score >= 7) return { nivel: "bueno", consecuencia: "ninguna" };
  if (score >= 6) return { nivel: "observacion", consecuencia: "flag" };
  if (score >= 5) return { nivel: "riesgo", consecuencia: "reducir_visibilidad" };
  return { nivel: "critico", consecuencia: "suspender" };
}

function accionesDe(c: ScoreConsecuencia, comp: ScoreComponente[]): string[] {
  const peor = [...comp].sort((a, b) => a.rate - b.rate)[0];
  const causa = peor ? `Área más débil: ${peor.label} (${Math.round(peor.rate * 100)}%).` : "";
  switch (c) {
    case "flag":
      return ["Marcar en observación.", "Notificar al proveedor el área a mejorar.", causa];
    case "reducir_visibilidad":
      return ["Reducir prioridad en el catálogo y en la asignación de RFQs.", "Plan de mejora a 30 días.", causa];
    case "suspender":
      return ["Suspender asignación de nuevas órdenes.", "Escalar a éxito de proveedor.", causa];
    default:
      return ["Sin acción. Mantener nivel."];
  }
}

export const NIVEL_LABEL: Record<ScoreNivel, string> = {
  elite: "Élite",
  bueno: "Bueno",
  observacion: "En observación",
  riesgo: "En riesgo",
  critico: "Crítico",
};

export const CONSECUENCIA_LABEL: Record<ScoreConsecuencia, string> = {
  ninguna: "Sin acción",
  flag: "Observación",
  reducir_visibilidad: "Visibilidad reducida",
  suspender: "Suspensión",
};
