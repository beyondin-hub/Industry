import { deliveryPromise, esFronteriza, zonaDe, type DeliveryPromise } from "@/lib/logistics/zones";

export type FulfillmentMode = "fulfillment_tj" | "dropshipping" | "entrega_directa";

export interface FulfillmentDecision {
  modo: FulfillmentMode;
  modoLabel: string;
  carrier: string;
  promesa: DeliveryPromise;
  razon: string;
}

const MODO_LABEL: Record<FulfillmentMode, string> = {
  fulfillment_tj: "Fulfillment Novak (Tijuana)",
  dropshipping: "Dropshipping orquestado",
  entrega_directa: "Entrega directa gestionada",
};

// Carrier por zona (agregador multi-carrier en producción).
function carrierPorZona(ciudad: string): string {
  if (esFronteriza(ciudad)) return "Flota Novak / Estafeta";
  const z = zonaDe(ciudad);
  if (z === "norte") return "Estafeta";
  if (z === "bajio" || z === "centro") return "FedEx / Estafeta";
  return "Paquetexpress";
}

/**
 * Motor de ruteo: elige el modo de cumplimiento óptimo.
 * Reglas:
 *  1) Franja fronteriza + proveedor con fulfillment TJ + stock en hub → Fulfillment TJ.
 *  2) Proveedor con dropshipping → Dropshipping orquestado (cobertura nacional).
 *  3) Si no, Entrega directa gestionada por Novak.
 */
export function decideFulfillment(input: {
  buyerCity: string;
  providerModes: FulfillmentMode[];
  stockEnHub?: boolean;
  urgente?: boolean;
}): FulfillmentDecision {
  const { buyerCity, providerModes } = input;
  const frontera = esFronteriza(buyerCity);

  if (frontera && providerModes.includes("fulfillment_tj") && input.stockEnHub) {
    return {
      modo: "fulfillment_tj",
      modoLabel: MODO_LABEL.fulfillment_tj,
      carrier: "Flota Novak",
      promesa: deliveryPromise({ destino: buyerCity, modo: "fulfillment_tj", stockConfirmado: true, urgente: input.urgente }),
      razon: "Destino en franja fronteriza con stock consolidado en el Hub Tijuana.",
    };
  }
  if (providerModes.includes("dropshipping")) {
    return {
      modo: "dropshipping",
      modoLabel: MODO_LABEL.dropshipping,
      carrier: carrierPorZona(buyerCity),
      promesa: deliveryPromise({ destino: buyerCity, modo: "dropshipping", urgente: input.urgente }),
      razon: "El proveedor surte y Novak coordina la guía, Carta Porte y el rastreo.",
    };
  }
  return {
    modo: "entrega_directa",
    modoLabel: MODO_LABEL.entrega_directa,
    carrier: carrierPorZona(buyerCity),
    promesa: deliveryPromise({ destino: buyerCity, modo: "entrega_directa", urgente: input.urgente }),
    razon: "Novak gestiona la última milla a la planta del comprador.",
  };
}

/** Modos de cumplimiento de un proveedor (demo: deriva del stock confirmado). */
export function providerModesFromFlags(stockConfirmado: boolean, fulfillment?: string[]): FulfillmentMode[] {
  if (fulfillment && fulfillment.length) return fulfillment as FulfillmentMode[];
  return stockConfirmado ? ["fulfillment_tj", "dropshipping"] : ["dropshipping"];
}
