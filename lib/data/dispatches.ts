import { ORDERS } from "@/lib/data/account";
import { getProvider, PROVIDERS } from "@/lib/data/providers";
import { BUYER_COMPANIES } from "@/lib/data/admin";
import { decideFulfillment, providerModesFromFlags } from "@/lib/logistics/routing";

export type DispatchEstado = "pendiente" | "impreso" | "despachado" | "vencido";

export interface DispatchInstruction {
  id: string;
  order_id: string;
  provider_id: string;
  folio: string;
  destino: string;
  empresa: string;
  carrier: string;
  guia: string;
  etiqueta_url: string;
  estado: DispatchEstado;
  deadline: string;
  evidencia_url?: string;
  confirmado_at?: string;
  sla_horas?: number;
  created_at: string;
}

// Demo: deadlines relativos a "ahora" para mostrar un mix realista
// (por despachar con tiempo, vs. vencidos), no anclados a la fecha de la orden.
function deadlineDemo(i: number): string {
  const offsets = [4, 2, -3, 6, 1, -1]; // horas desde ahora (negativo = vencido)
  return new Date(Date.now() + (offsets[i % offsets.length] ?? 4) * 36e5).toISOString();
}

/** Construye un despacho dropshipping a partir de una orden (demo). */
export function buildDispatch(order: any, i = 0): DispatchInstruction {
  const company = BUYER_COMPANIES.find((c) => c.id === order.company_id);
  const prov = getProvider(order.provider_id);
  const destino = company?.ciudad ?? "Monterrey";
  const modes = providerModesFromFlags(prov?.stock_confirmado ?? false);
  const dec = decideFulfillment({ buyerCity: destino, providerModes: modes, stockEnHub: prov?.stock_confirmado });
  const estados: DispatchEstado[] = ["pendiente", "impreso", "despachado", "pendiente"];
  const estado = estados[i % estados.length];
  const guia = estado === "pendiente" ? "" : `EST${String(200000 + i * 173).slice(0, 6)}MX`;
  // Demo: atribuye los despachos al proveedor demo (PROVIDERS[0]) para que
  // el portal del proveedor muestre una bandeja completa.
  const provider_id = PROVIDERS[0]?.id ?? order.provider_id;
  return {
    id: `dsp-${order.id}`,
    order_id: order.id,
    provider_id,
    folio: order.folio,
    destino,
    empresa: company?.nombre ?? "Comprador",
    carrier: dec.carrier,
    guia,
    etiqueta_url: guia ? `https://rastreo.novak.mx/etiqueta/${guia}.pdf` : "",
    estado,
    deadline: deadlineDemo(i),
    evidencia_url: estado === "despachado" ? "https://rastreo.novak.mx/evidencia/demo.jpg" : undefined,
    confirmado_at: estado === "despachado" ? new Date().toISOString() : undefined,
    sla_horas: estado === "despachado" ? 3.4 : undefined,
    created_at: order.created_at,
  };
}

// Despachos demo: solo órdenes en dropshipping (no fulfillment_tj).
export const DISPATCHES: DispatchInstruction[] = ORDERS.filter((o) => o.estado !== "cancelada")
  .map((o, i) => buildDispatch(o, i))
  .filter((_, i) => i < 6);
