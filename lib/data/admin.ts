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
