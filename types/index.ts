// ────────────────────────────────────────────────────────────
// Novak — Tipos de dominio
// Reflejan el esquema de Supabase (ver supabase/migrations).
// ────────────────────────────────────────────────────────────

export type Industria =
  | "automotriz"
  | "electronica"
  | "medico"
  | "aeroespacial"
  | "plasticos"
  | "metalmecanica"
  | "alimentos";

export type Ciudad =
  | "Tijuana"
  | "Mexicali"
  | "Ciudad Juárez"
  | "Monterrey"
  | "Reynosa"
  | "Hermosillo"
  | "Saltillo";

export type RolComprador = "comprador" | "autorizador" | "admin_empresa";

export type CategoriaMRO =
  | "rodamientos"
  | "epp"
  | "lubricantes"
  | "herramientas"
  | "neumatica"
  | "electrico"
  | "abrasivos"
  | "sujetadores"
  | "sellos"
  | "filtros";

export type PlanMembresia = "basico" | "premium" | "enterprise";

export interface Company {
  id: string;
  nombre: string;
  rfc: string;
  industria: Industria;
  ciudad: Ciudad;
  credito_aprobado: boolean;
  limite_credito: number;
  dias_credito: 0 | 30 | 60 | 90;
  created_at: string;
}

export interface Buyer {
  id: string;
  company_id: string;
  nombre: string;
  puesto: string;
  telefono: string;
  rol: RolComprador;
  limite_compra: number;
  email?: string;
  created_at: string;
}

export interface Provider {
  id: string;
  razon_social: string;
  rfc: string;
  nombre_comercial: string;
  ciudad: Ciudad;
  categorias: CategoriaMRO[];
  certificaciones: string[];
  score: number;
  stock_confirmado: boolean;
  credito_disponible: number;
  activo: boolean;
  plan_membresia: PlanMembresia;
  estado?: "pendiente" | "aprobado" | "suspendido";
  es_fundador?: boolean;
  created_at: string;
}

export interface PriceTier {
  cantidad_minima: number;
  precio: number;
}

export interface Product {
  id: string;
  provider_id: string;
  nombre: string;
  numero_parte: string;
  marca: string;
  categoria: CategoriaMRO;
  subcategoria: string;
  descripcion: string;
  especificaciones: Record<string, string>;
  certificaciones: string[];
  precio_base: number;
  precio_minimo: number;
  unidad: string;
  stock_actual: number;
  stock_minimo: number;
  tiempo_entrega_horas: number;
  imagen_url?: string;
  ficha_tecnica_url?: string;
  cad_url?: string;
  activo: boolean;
  price_tiers: PriceTier[];
  created_at: string;
}

export type EstadoRFQ =
  | "nuevo"
  | "en_proceso"
  | "cotizado"
  | "aprobado"
  | "cerrado";

export type Urgencia = "urgente_24h" | "normal" | "programado";
export type CondicionPago = "contado" | "30" | "60" | "90";

export interface RFQItem {
  id: string;
  rfq_id: string;
  product_id?: string;
  descripcion: string;
  numero_parte?: string;
  cantidad: number;
  unidad: string;
  certificacion_requerida?: string;
  imagen_url?: string;
}

export interface RFQ {
  id: string;
  folio: string;
  buyer_id: string;
  company_id: string;
  estado: EstadoRFQ;
  urgencia: Urgencia;
  condicion_pago: CondicionPago;
  requiere_cfdi: boolean;
  notas?: string;
  total_estimado: number;
  created_at: string;
  deadline_cotizacion: string;
  items: RFQItem[];
}

export type EstadoCotizacion = "pendiente" | "enviada" | "aceptada" | "rechazada";

export interface Quotation {
  id: string;
  folio: string;
  rfq_id: string;
  provider_id: string;
  estado: EstadoCotizacion;
  subtotal: number;
  comision_broker: number;
  iva: number;
  total: number;
  tiempo_entrega_horas: number;
  condicion_pago: CondicionPago;
  valida_hasta: string;
  pdf_url?: string;
  created_at: string;
}

export type EstadoOrden =
  | "confirmada"
  | "en_preparacion"
  | "en_transito"
  | "entregada"
  | "cancelada";

export interface Order {
  id: string;
  folio: string;
  quotation_id: string;
  company_id: string;
  estado: EstadoOrden;
  total: number;
  es_credito: boolean;
  fecha_vencimiento_credito?: string;
  pagado?: boolean;
  fecha_pago?: string;
  metodo_pago?: string;
  tracking_url?: string;
  cfdi_url?: string;
  cfdi_uuid?: string;
  notas_entrega?: string;
  categoria: CategoriaMRO;
  provider_id: string;
  created_at: string;
  entregada_at?: string;
}

export interface AutoReorder {
  id: string;
  company_id: string;
  product_id: string;
  cantidad: number;
  frecuencia_dias: number;
  descuento_pct: number;
  activo: boolean;
  proxima_fecha: string;
}

export interface ShoppingList {
  id: string;
  company_id: string;
  nombre: string;
  es_favorita: boolean;
  items: { product_id: string; cantidad: number }[];
}

export type TipoNotificacion =
  | "cotizacion_lista"
  | "orden_en_transito"
  | "stock_bajo"
  | "credito_vence";

export interface Notification {
  id: string;
  buyer_id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  canal: "web" | "whatsapp" | "email";
  created_at: string;
}

export interface CartItem {
  product: Product;
  cantidad: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
