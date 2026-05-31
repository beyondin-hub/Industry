import { ORDERS } from "@/lib/data/account";
import { getProvider } from "@/lib/data/providers";
import type { Order } from "@/types";
import { BUYER_COMPANIES } from "@/lib/data/admin";
import { decideFulfillment, providerModesFromFlags } from "@/lib/logistics/routing";

export type ShipmentEstado = "creado" | "recolectado" | "en_transito" | "entregado" | "incidencia";

export interface Shipment {
  id: string;
  order_id: string;
  folio: string;
  empresa: string;
  destino: string;
  proveedor: string;
  modo: "fulfillment_tj" | "dropshipping" | "entrega_directa";
  modoLabel: string;
  carrier: string;
  guia: string;
  zona: string;
  eta_horas: number;
  etiqueta: string;
  estado: ShipmentEstado;
  created_at: string;
}

const ESTADO_DE_ORDEN: Record<string, ShipmentEstado> = {
  confirmada: "creado",
  en_preparacion: "recolectado",
  en_transito: "en_transito",
  entregada: "entregado",
  cancelada: "incidencia",
};

function guiaFalsa(modo: string, i: number) {
  const pre = modo === "fulfillment_tj" ? "NVK" : "EST";
  return `${pre}${String(100000 + i * 137).slice(0, 6)}MX`;
}

export function buildShipment(order: Order, i = 0): Shipment {
  const company = BUYER_COMPANIES.find((c) => c.id === order.company_id);
  const prov = getProvider(order.provider_id);
  const destino = company?.ciudad ?? "Tijuana";
  const modes = providerModesFromFlags(prov?.stock_confirmado ?? false);
  const dec = decideFulfillment({ buyerCity: destino, providerModes: modes, stockEnHub: prov?.stock_confirmado });
  return {
    id: `shp-${order.id}`,
    order_id: order.id,
    folio: order.folio,
    empresa: company?.nombre ?? "Comprador",
    destino,
    proveedor: prov?.nombre_comercial ?? "Proveedor",
    modo: dec.modo,
    modoLabel: dec.modoLabel,
    carrier: dec.carrier,
    guia: guiaFalsa(dec.modo, i),
    zona: dec.promesa.zona,
    eta_horas: dec.promesa.eta_horas,
    etiqueta: dec.promesa.etiqueta,
    estado: ESTADO_DE_ORDEN[order.estado] ?? "creado",
    created_at: order.created_at,
  };
}

export const SHIPMENTS: Shipment[] = ORDERS.map((o, i) => buildShipment(o, i));
