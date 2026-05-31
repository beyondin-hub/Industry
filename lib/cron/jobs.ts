// Catálogo de tareas programadas (Vercel Cron). Refleja vercel.json.
export interface CronJob {
  path: string;
  nombre: string;
  schedule: string;
  cadencia: string;
  descripcion: string;
}

export const CRON_JOBS: CronJob[] = [
  {
    path: "/api/cron/check-rfq-guarantee",
    nombre: "Garantía de cotización 2h",
    schedule: "0 * * * *",
    cadencia: "Cada hora",
    descripcion: "RFQs sin cotización tras el deadline de 2h hábiles → activa el beneficio 0% comisión.",
  },
  {
    path: "/api/cron/sync-tracking",
    nombre: "Sincronización de rastreo",
    schedule: "0 */2 * * *",
    cadencia: "Cada 2 horas",
    descripcion: "Actualiza el estado de los envíos en tránsito con el carrier (EnvíaYa).",
  },
  {
    path: "/api/cron/check-dispatch-deadline",
    nombre: "Deadline de despacho",
    schedule: "30 * * * *",
    cadencia: "Cada hora",
    descripcion: "Marca como vencidos los despachos del proveedor no confirmados a tiempo.",
  },
  {
    path: "/api/cron/check-credit-expiry",
    nombre: "Vencimiento de crédito",
    schedule: "0 9 * * *",
    cadencia: "Diario 9:00",
    descripcion: "Recuerda créditos B2B por vencer (3 días) y marca los vencidos.",
  },
  {
    path: "/api/cron/check-auto-reorders",
    nombre: "Reórdenes automáticas",
    schedule: "0 7 * * *",
    cadencia: "Diario 7:00",
    descripcion: "Dispara las reórdenes recurrentes cuya fecha programada llegó.",
  },
  {
    path: "/api/cron/check-cert-expiry",
    nombre: "Certificaciones por vencer",
    schedule: "0 8 * * 1",
    cadencia: "Lunes 8:00",
    descripcion: "Avisa a proveedores con certificaciones que vencen en 30 días.",
  },
  {
    path: "/api/cron/calculate-scores",
    nombre: "Recálculo de scoring",
    schedule: "0 6 1 * *",
    cadencia: "Mensual (día 1)",
    descripcion: "Recalcula el score de proveedores y aplica consecuencias automáticas.",
  },
];
