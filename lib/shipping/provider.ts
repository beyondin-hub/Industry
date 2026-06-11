// ────────────────────────────────────────────────────────────
// Novak — Abstracción de paquetería (ShippingProvider).
// Interfaz neutra al carrier. Hoy: adaptador EnvíaYa (multi-carrier)
// con fallback demo. Mañana: envia.com, Skydropx, etc. sin tocar la app.
// ────────────────────────────────────────────────────────────

export interface ShippingAddress {
  ciudad: string;
  estado?: string;
  cp?: string;
  pais?: string;
  calle?: string;
  nombre?: string;
  telefono?: string;
}

export interface ParcelDims {
  peso_kg: number;
  largo_cm?: number;
  ancho_cm?: number;
  alto_cm?: number;
  descripcion?: string;
}

export interface RateQuoteInput {
  origen: ShippingAddress;
  destino: ShippingAddress;
  paquete: ParcelDims;
  urgente?: boolean;
}

export interface CarrierRate {
  id: string;
  carrier: string; // "Estafeta", "FedEx", "Paquetexpress"
  servicio: string; // "Día siguiente", "Económico"
  servicio_code: string;
  costo: number; // MXN con IVA
  dias_estimados: number;
  eta_horas: number;
  recomendado?: boolean;
}

export interface CreateLabelInput {
  rateId?: string;
  carrier: string;
  servicio_code: string;
  origen: ShippingAddress;
  destino: ShippingAddress;
  paquete: ParcelDims;
  referencia?: string; // folio de la orden
  conCartaPorte?: boolean;
}

export interface ShippingLabel {
  guia: string;
  carrier: string;
  servicio: string;
  tracking_url: string;
  etiqueta_url: string; // PDF de la etiqueta
  costo: number;
  eta_horas: number;
  carta_porte_uuid?: string;
}

export type EstadoEnvio = "creado" | "recolectado" | "en_transito" | "entregado" | "incidencia";

export interface TrackingEvent {
  fecha: string;
  estado: EstadoEnvio;
  descripcion: string;
  ubicacion?: string;
}

export interface TrackingStatus {
  guia: string;
  carrier: string;
  estado: EstadoEnvio;
  eta_horas?: number;
  eventos: TrackingEvent[];
}

export interface ShippingProvider {
  readonly id: string;
  readonly nombre: string;
  readonly esDemo: boolean;
  cotizar(input: RateQuoteInput): Promise<CarrierRate[]>;
  generarGuia(input: CreateLabelInput): Promise<ShippingLabel>;
  rastrear(guia: string, carrier?: string): Promise<TrackingStatus>;
  parseWebhook(payload: unknown): TrackingStatus | null;
}
