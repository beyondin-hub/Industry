import { Badge } from "@/components/ui/badge";
import type {
  EstadoCotizacion,
  EstadoOrden,
  EstadoRFQ,
  Urgencia,
} from "@/types";

const RFQ_MAP: Record<EstadoRFQ, { label: string; variant: any }> = {
  nuevo: { label: "Nuevo", variant: "steel" },
  en_proceso: { label: "En proceso", variant: "warning" },
  cotizado: { label: "Cotizado", variant: "success" },
  aprobado: { label: "Aprobado", variant: "default" },
  cerrado: { label: "Cerrado", variant: "secondary" },
};

const ORDEN_MAP: Record<EstadoOrden, { label: string; variant: any }> = {
  confirmada: { label: "Confirmada", variant: "steel" },
  en_preparacion: { label: "En preparación", variant: "warning" },
  en_transito: { label: "En tránsito", variant: "accent" },
  entregada: { label: "Entregada", variant: "success" },
  cancelada: { label: "Cancelada", variant: "danger" },
};

const COT_MAP: Record<EstadoCotizacion, { label: string; variant: any }> = {
  pendiente: { label: "Pendiente", variant: "warning" },
  enviada: { label: "Enviada", variant: "accent" },
  aceptada: { label: "Aceptada", variant: "success" },
  rechazada: { label: "Rechazada", variant: "danger" },
};

const URGENCIA_MAP: Record<Urgencia, { label: string; variant: any }> = {
  urgente_24h: { label: "🔴 Urgente 24h", variant: "danger" },
  normal: { label: "Normal", variant: "secondary" },
  programado: { label: "Programado", variant: "steel" },
};

export function RFQStatus({ estado }: { estado: EstadoRFQ }) {
  const m = RFQ_MAP[estado];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

export function OrdenStatus({ estado }: { estado: EstadoOrden }) {
  const m = ORDEN_MAP[estado];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

export function CotizacionStatus({ estado }: { estado: EstadoCotizacion }) {
  const m = COT_MAP[estado];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

export function UrgenciaBadge({ urgencia }: { urgencia: Urgencia }) {
  const m = URGENCIA_MAP[urgencia];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
