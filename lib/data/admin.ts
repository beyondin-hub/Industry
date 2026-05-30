import type { AdminRole } from "@/lib/admin/permissions";
import type { Industria, Ciudad } from "@/types";

export interface TeamMember {
  id: string;
  nombre: string;
  email: string;
  rol_admin: AdminRole;
  activo: boolean;
  created_at: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "tm-001", nombre: "Paulo Zaragoza", email: "paulo@heynovak.com", rol_admin: "super_admin", activo: true, created_at: "2025-01-10T00:00:00Z" },
  { id: "tm-002", nombre: "Andrea Beltrán", email: "andrea@heynovak.com", rol_admin: "ops", activo: true, created_at: "2025-02-01T00:00:00Z" },
  { id: "tm-003", nombre: "Luis Cárdenas", email: "luis@heynovak.com", rol_admin: "finanzas", activo: true, created_at: "2025-02-15T00:00:00Z" },
  { id: "tm-004", nombre: "Mariana Ortiz", email: "mariana@heynovak.com", rol_admin: "soporte", activo: false, created_at: "2025-03-01T00:00:00Z" },
];

export interface BuyerCompany {
  id: string;
  nombre: string;
  rfc: string;
  industria: Industria;
  ciudad: Ciudad;
  credito_aprobado: boolean;
  limite_credito: number;
  dias_credito: 0 | 30 | 60 | 90;
  kyc_estado: "pendiente" | "verificado" | "rechazado";
  estado: "activa" | "suspendida";
  exposicion: number;   // crédito usado vigente
  gmv6m: number;        // compras últimos 6 meses
  created_at: string;
}

export const BUYER_COMPANIES: BuyerCompany[] = [
  { id: "comp-001", nombre: "Maquiladora Componentes del Pacífico", rfc: "MCP190501XY2", industria: "automotriz", ciudad: "Tijuana", credito_aprobado: true, limite_credito: 850000, dias_credito: 60, kyc_estado: "verificado", estado: "activa", exposicion: 70440, gmv6m: 597600, created_at: "2025-02-01T00:00:00Z" },
  { id: "comp-002", nombre: "Electro Ensambles Fronterizos", rfc: "EEF200815AB3", industria: "electronica", ciudad: "Ciudad Juárez", credito_aprobado: true, limite_credito: 500000, dias_credito: 30, kyc_estado: "verificado", estado: "activa", exposicion: 128000, gmv6m: 410000, created_at: "2025-03-10T00:00:00Z" },
  { id: "comp-003", nombre: "Dispositivos Médicos Mexicali", rfc: "DMM210420CD4", industria: "medico", ciudad: "Mexicali", credito_aprobado: false, limite_credito: 0, dias_credito: 0, kyc_estado: "pendiente", estado: "activa", exposicion: 0, gmv6m: 142000, created_at: new Date(Date.now() - 12 * 86_400_000).toISOString() },
  { id: "comp-004", nombre: "Aeropartes del Norte", rfc: "APN180922EF5", industria: "aeroespacial", ciudad: "Hermosillo", credito_aprobado: true, limite_credito: 300000, dias_credito: 30, kyc_estado: "verificado", estado: "suspendida", exposicion: 295000, gmv6m: 220000, created_at: "2024-11-05T00:00:00Z" },
];

export interface AuditEntry {
  id: string;
  actor_nombre: string;
  accion: string;
  entidad: string;
  entidad_id: string;
  detalle: string;
  created_at: string;
}

const h = (n: number) => new Date(Date.now() + n * 3_600_000).toISOString();

export const AUDIT_LOG: AuditEntry[] = [
  { id: "a1", actor_nombre: "Andrea Beltrán", accion: "provider.approve", entidad: "provider", entidad_id: "RodaNorte", detalle: "Aprobó al proveedor y activó su catálogo", created_at: h(-2) },
  { id: "a2", actor_nombre: "Luis Cárdenas", accion: "credit.set_line", entidad: "company", entidad_id: "comp-002", detalle: "Ajustó línea de crédito a $500,000 / 30 días", created_at: h(-5) },
  { id: "a3", actor_nombre: "Andrea Beltrán", accion: "quotation.create", entidad: "rfq", entidad_id: "MRO-2026-0148", detalle: "Generó cotización COT-2026-0210 para el comprador", created_at: h(-7) },
  { id: "a4", actor_nombre: "Paulo Zaragoza", accion: "team.invite", entidad: "team_member", entidad_id: "mariana@heynovak.com", detalle: "Invitó a un nuevo operador (rol: soporte)", created_at: h(-26) },
  { id: "a5", actor_nombre: "Luis Cárdenas", accion: "payout.disperse", entidad: "order", entidad_id: "OC-2026-0298", detalle: "Dispersó pago al proveedor RodaNorte", created_at: h(-30) },
];

export interface CreditRequest {
  id: string;
  company_id: string;
  empresa: string;
  industria: Industria;
  ciudad: Ciudad;
  limite_solicitado: number;
  gmv6m: number;
  antiguedad_meses: number;
  estado: "pendiente" | "aprobado" | "rechazado";
  created_at: string;
}

export const CREDIT_REQUESTS: CreditRequest[] = [
  { id: "cr-001", company_id: "comp-003", empresa: "Dispositivos Médicos Mexicali", industria: "medico", ciudad: "Mexicali", limite_solicitado: 400000, gmv6m: 142000, antiguedad_meses: 4, estado: "pendiente", created_at: new Date(Date.now() - 3 * 3_600_000).toISOString() },
  { id: "cr-002", company_id: "comp-002", empresa: "Electro Ensambles Fronterizos", industria: "electronica", ciudad: "Ciudad Juárez", limite_solicitado: 750000, gmv6m: 410000, antiguedad_meses: 9, estado: "pendiente", created_at: new Date(Date.now() - 20 * 3_600_000).toISOString() },
  { id: "cr-003", company_id: "comp-005", empresa: "Plásticos Inyectados de Reynosa", industria: "plasticos", ciudad: "Reynosa", limite_solicitado: 250000, gmv6m: 90000, antiguedad_meses: 2, estado: "pendiente", created_at: new Date(Date.now() - 40 * 3_600_000).toISOString() },
];

export interface TicketMessage { remitente: "comprador" | "proveedor" | "novak"; cuerpo: string; created_at: string; }
export interface Ticket {
  id: string;
  asunto: string;
  tipo: "incidencia" | "pregunta" | "reclamo" | "crédito";
  origen: "comprador" | "proveedor";
  origen_nombre: string;
  prioridad: "baja" | "media" | "alta";
  estado: "abierto" | "en_proceso" | "resuelto";
  created_at: string;
  mensajes: TicketMessage[];
}

export const TICKETS: Ticket[] = [
  {
    id: "tk-001", asunto: "Faltante en orden OC-2026-0312", tipo: "incidencia", origen: "comprador",
    origen_nombre: "Maquiladora Componentes del Pacífico", prioridad: "alta", estado: "abierto",
    created_at: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    mensajes: [
      { remitente: "comprador", cuerpo: "Recibimos 480 de 500 guantes. Faltan 20 pares de la orden OC-2026-0312.", created_at: new Date(Date.now() - 2 * 3_600_000).toISOString() },
    ],
  },
  {
    id: "tk-002", asunto: "¿Cuándo me pagan la cotización COT-2026-0210?", tipo: "pregunta", origen: "proveedor",
    origen_nombre: "RodaNorte", prioridad: "media", estado: "en_proceso",
    created_at: new Date(Date.now() - 9 * 3_600_000).toISOString(),
    mensajes: [
      { remitente: "proveedor", cuerpo: "Hola, ¿en qué fecha se dispersa el pago de la orden ya entregada?", created_at: new Date(Date.now() - 9 * 3_600_000).toISOString() },
      { remitente: "novak", cuerpo: "Hola RodaNorte, el pago va programado según tu plazo pactado (30 días). Te confirmo la fecha exacta hoy.", created_at: new Date(Date.now() - 8 * 3_600_000).toISOString() },
    ],
  },
  {
    id: "tk-003", asunto: "Solicito ampliación de línea de crédito", tipo: "crédito", origen: "comprador",
    origen_nombre: "Electro Ensambles Fronterizos", prioridad: "media", estado: "abierto",
    created_at: new Date(Date.now() - 26 * 3_600_000).toISOString(),
    mensajes: [
      { remitente: "comprador", cuerpo: "Necesitamos ampliar a $750,000 para el siguiente trimestre. ¿Qué requieren?", created_at: new Date(Date.now() - 26 * 3_600_000).toISOString() },
    ],
  },
];

export interface PlatformConfig {
  comisiones: { categoria: string; pct: number }[];
  credito: { score_minimo: number; plazo_max: number; exposicion_max_pct: number };
  fees: { financiamiento_pct: number; fulfillment_pct: number; entrega_por_orden: number };
  flags: { rfq_publico: boolean; credito_auto: boolean; busqueda_imagen: boolean; reorden_auto: boolean };
}

export const PLATFORM_CONFIG: PlatformConfig = {
  comisiones: [
    { categoria: "rodamientos", pct: 12 }, { categoria: "epp", pct: 14 }, { categoria: "lubricantes", pct: 12 },
    { categoria: "herramientas", pct: 10 }, { categoria: "neumatica", pct: 11 }, { categoria: "electrico", pct: 11 },
    { categoria: "abrasivos", pct: 13 }, { categoria: "sujetadores", pct: 15 }, { categoria: "sellos", pct: 13 }, { categoria: "filtros", pct: 12 },
  ],
  credito: { score_minimo: 45, plazo_max: 90, exposicion_max_pct: 85 },
  fees: { financiamiento_pct: 3, fulfillment_pct: 3, entrega_por_orden: 350 },
  flags: { rfq_publico: true, credito_auto: false, busqueda_imagen: false, reorden_auto: true },
};
