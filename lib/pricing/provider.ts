import {
  Percent, Banknote, Warehouse, Truck, Layers, Star, BarChart3,
  type LucideIcon,
} from "lucide-react";

// ────────────────────────────────────────────────────────────
// Modelo de ingresos de Novak para PROVEEDORES.
// Sin cuota de entrada ni mensualidad: solo comisión por transacción.
// Los fees avanzados son situacionales / opt-in (Novak gana cuando el
// proveedor gana más: financiamiento, fulfillment, logística, visibilidad).
// ────────────────────────────────────────────────────────────

export const PROVIDER_MODEL = {
  cuotaEntrada: 0,
  mensualidad: 0,
  comisionBase: { min: 8, max: 12 }, // % del GMV por transacción cerrada
  skusGratis: 300,
} as const;

export interface RevenueStream {
  id: string;
  nombre: string;
  valor: string;
  icon: LucideIcon;
  desc: string;
  opcional: boolean;
}

export const REVENUE_STREAMS: RevenueStream[] = [
  {
    id: "comision",
    nombre: "Comisión por transacción",
    valor: "8–12%",
    icon: Percent,
    desc: "Solo pagas cuando vendes. Sin cuota de alta ni mensualidad. La comisión se descuenta del pedido cerrado.",
    opcional: false,
  },
  {
    id: "financiamiento",
    nombre: "Financiamiento Novak",
    valor: "+2–4%",
    icon: Banknote,
    desc: "Cuando Novak otorga el crédito a la maquiladora y te paga a ti por adelantado/a corto plazo. Tú cobras seguro; Novak asume el riesgo de cobranza.",
    opcional: true,
  },
  {
    id: "fulfillment",
    nombre: "Fulfillment Tijuana",
    valor: "desde 3%",
    icon: Warehouse,
    desc: "Almacenamos tu inventario en nuestro centro en Tijuana y preparamos los pedidos. Entregas 24-48h sin montar logística propia.",
    opcional: true,
  },
  {
    id: "entrega",
    nombre: "Entrega directa gestionada",
    valor: "fee por orden",
    icon: Truck,
    desc: "Novak coordina la última milla a la planta del comprador. Tú no tocas la logística.",
    opcional: true,
  },
  {
    id: "skus",
    nombre: "Catálogo extendido",
    valor: `tras ${PROVIDER_MODEL.skusGratis} SKUs`,
    icon: Layers,
    desc: `Sube hasta ${PROVIDER_MODEL.skusGratis} SKUs sin costo. Arriba de eso, un plan de catálogo por volumen de productos.`,
    opcional: true,
  },
  {
    id: "visibilidad",
    nombre: "Visibilidad destacada",
    valor: "opcional",
    icon: Star,
    desc: "Aparece primero en los RFQs relevantes a tus categorías y obtén el badge de proveedor destacado.",
    opcional: true,
  },
  {
    id: "inteligencia",
    nombre: "Inteligencia de mercado",
    valor: "suscripción",
    icon: BarChart3,
    desc: "Precios promedio, demanda por categoría y tendencias para que cotices mejor.",
    opcional: true,
  },
];

// Opciones de cumplimiento que el proveedor elige en su alta.
export const FULFILLMENT_OPTIONS = [
  {
    id: "fulfillment_tj",
    nombre: "Fulfillment Novak (Tijuana)",
    desc: "Mandas tu inventario a nuestro almacén en Tijuana. Nosotros recibimos, almacenamos y preparamos cada pedido. Máxima velocidad de entrega.",
  },
  {
    id: "dropshipping",
    nombre: "Dropshipping",
    desc: "Conservas tu inventario. Cuando se cierra un pedido, lo preparas y nosotros coordinamos la recolección/entrega a la maquiladora.",
  },
  {
    id: "entrega_directa",
    nombre: "Entrega directa gestionada por Novak",
    desc: "Tú surtes; Novak gestiona la última milla y la entrega a planta (con dirección enmascarada hasta el despacho).",
  },
] as const;
