// ────────────────────────────────────────────────────────────
// Novak — Monitoreo de errores (compatible con Sentry / webhook).
// Sin dependencias: si SENTRY_DSN o MONITORING_WEBHOOK_URL están
// configurados, reporta el evento; si no, registra en consola (demo).
// Para Sentry completo: añadir @sentry/nextjs y reemplazar captureError.
// ────────────────────────────────────────────────────────────

export interface MonitoringEvent {
  level?: "error" | "warning" | "info";
  message: string;
  contexto?: Record<string, unknown>;
}

export function monitoringActivo(): boolean {
  return !!(process.env.SENTRY_DSN || process.env.MONITORING_WEBHOOK_URL);
}

/** Reporta un evento al backend de monitoreo (no lanza nunca). */
export async function captureEvent(ev: MonitoringEvent): Promise<void> {
  const payload = {
    level: ev.level ?? "error",
    message: ev.message,
    contexto: ev.contexto ?? {},
    entorno: process.env.VERCEL_ENV ?? "development",
    timestamp: new Date().toISOString(),
  };

  const webhook = process.env.MONITORING_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      return;
    } catch {
      /* cae a consola */
    }
  }

  // Sin backend: traza estructurada (visible en logs de Vercel).
  const tag = `[novak:${payload.level}]`;
  if (payload.level === "error") console.error(tag, payload.message, payload.contexto);
  else console.warn(tag, payload.message, payload.contexto);
}

/** Envuelve una función async reportando cualquier excepción. */
export async function withMonitoring<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    await captureEvent({ message: `${label}: ${e?.message ?? "error"}`, contexto: { stack: e?.stack } });
    throw e;
  }
}
