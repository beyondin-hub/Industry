import type { SectorSlug } from "@/types";

export interface SectorAlert {
  tone: "warning" | "info" | "accent";
  text: string;
}

// Alertas contextuales que reemplazan a las genéricas cuando hay sector activo.
const ALERTS: Record<SectorSlug, SectorAlert[]> = {
  medical: [
    { tone: "warning", text: "Filtros HEPA H14 en stock — 12 unidades disponibles en Tijuana." },
    { tone: "info", text: "Nueva guía: Checklist de insumos para auditoría FDA disponible." },
    { tone: "accent", text: "Proveedor de guantes ISO 13485 con oferta especial esta semana." },
  ],
  electronics: [
    { tone: "warning", text: "Squeegee blades DEK en stock — entrega mañana antes de 10 AM." },
    { tone: "info", text: "Nueva guía: Consumibles críticos que toda línea SMT debe tener." },
    { tone: "accent", text: "IPA 99% grado electrónico — precio especial por galón." },
  ],
};

export function sectorAlerts(slug?: string): SectorAlert[] {
  if (slug === "medical" || slug === "electronics") return ALERTS[slug];
  return [];
}

export const ALERT_TONE_CLASS: Record<SectorAlert["tone"], string> = {
  warning: "border-amber-300 bg-amber-50 text-amber-800",
  info: "border-info/30 bg-blue-50 text-info",
  accent: "border-orange-300 bg-orange-50 text-orange-800",
};
