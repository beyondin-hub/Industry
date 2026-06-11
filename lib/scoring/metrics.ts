import { createClient } from "@/lib/supabase/server";
import { PROVIDERS } from "@/lib/data/providers";
import { scoreProvider, type ProviderMetrics, type ScoreBreakdown } from "@/lib/scoring/engine";
import type { Provider } from "@/types";

export interface ProviderScoreRow {
  provider_id: string;
  nombre: string;
  ciudad: string;
  metrics: ProviderMetrics;
  breakdown: ScoreBreakdown;
}

// Demo: deriva métricas deterministas del score histórico del proveedor,
// para que el panel y el cron tengan datos coherentes sin DB.
function demoMetricsFor(p: Provider): ProviderMetrics {
  const base = Math.max(0.4, Math.min(1, p.score / 5)); // score demo viene en escala ~0–5
  const n = 20 + (p.id.charCodeAt(p.id.length - 1) % 10);
  const ratio = (extra: number) => Math.round(n * Math.max(0, Math.min(1, base + extra)));
  return {
    rfqsAsignados: n,
    cotizacionesTotal: n,
    cotizacionesATiempo: ratio(0.02),
    ordenesAsignadas: Math.round(n * 0.7),
    ordenesSurtidas: Math.round(n * 0.7 * base),
    despachosTotal: Math.round(n * 0.6),
    despachosATiempo: Math.round(n * 0.6 * Math.min(1, base + 0.05)),
    entregas: Math.round(n * 0.6),
    incidencias: Math.max(0, Math.round(n * 0.6 * (1 - base) * 0.5)),
  };
}

/** Calcula el scorecard de todos los proveedores (demo o DB). */
export async function fetchProviderScores(): Promise<ProviderScoreRow[]> {
  const supabase = createClient();
  const providers: Provider[] = PROVIDERS;
  // En producción: leer métricas agregadas de rfqs/orders/dispatch_instructions.
  // Hoy degradamos a demo determinista (resiliente sin esquema de métricas).
  void supabase;
  return providers.map((p) => {
    const metrics = demoMetricsFor(p);
    return { provider_id: p.id, nombre: p.nombre_comercial, ciudad: p.ciudad, metrics, breakdown: scoreProvider(metrics) };
  });
}
