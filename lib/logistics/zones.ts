// ────────────────────────────────────────────────────────────
// Novak — Zonas de entrega y promesa de ETA.
// La franja fronteriza es la zona core (fulfillment Tijuana); el resto del
// país se atiende por dropshipping/carrier con ETA por zona.
// ────────────────────────────────────────────────────────────

export type Zona = "fronteriza" | "norte" | "bajio" | "centro" | "sur";

interface ZonaDef {
  zona: Zona;
  label: string;
  eta_base_horas: number; // ETA típica por carrier nacional
}

const ZONAS: Record<Zona, ZonaDef> = {
  fronteriza: { zona: "fronteriza", label: "Franja fronteriza", eta_base_horas: 36 },
  norte: { zona: "norte", label: "Norte", eta_base_horas: 60 },
  bajio: { zona: "bajio", label: "Bajío", eta_base_horas: 72 },
  centro: { zona: "centro", label: "Centro", eta_base_horas: 84 },
  sur: { zona: "sur", label: "Sur", eta_base_horas: 108 },
};

// Mapa ciudad → zona (incluye las ciudades del catálogo y otras comunes).
const CIUDAD_ZONA: Record<string, Zona> = {
  tijuana: "fronteriza", mexicali: "fronteriza", tecate: "fronteriza",
  "ciudad juárez": "fronteriza", "ciudad juarez": "fronteriza", juárez: "fronteriza", juarez: "fronteriza",
  reynosa: "fronteriza", matamoros: "fronteriza", nogales: "fronteriza", "nuevo laredo": "fronteriza", "piedras negras": "fronteriza",
  monterrey: "norte", saltillo: "norte", hermosillo: "norte", chihuahua: "norte", torreón: "norte", torreon: "norte",
  querétaro: "bajio", queretaro: "bajio", aguascalientes: "bajio", "san luis potosí": "bajio", león: "bajio", leon: "bajio", guanajuato: "bajio", celaya: "bajio",
  "ciudad de méxico": "centro", cdmx: "centro", toluca: "centro", puebla: "centro", querretaro: "centro",
  guadalajara: "centro", mérida: "sur", merida: "sur", veracruz: "sur", oaxaca: "sur", cancún: "sur", cancun: "sur",
};

const FRONTERIZAS = new Set<string>(["tijuana", "mexicali", "tecate", "ciudad juárez", "ciudad juarez", "reynosa", "matamoros", "nogales", "nuevo laredo", "piedras negras"]);

export function zonaDe(ciudad?: string): Zona {
  if (!ciudad) return "centro";
  return CIUDAD_ZONA[ciudad.trim().toLowerCase()] ?? "norte";
}
export function esFronteriza(ciudad?: string): boolean {
  return !!ciudad && FRONTERIZAS.has(ciudad.trim().toLowerCase());
}
export function zonaLabel(z: Zona): string {
  return ZONAS[z].label;
}
export function etaBase(ciudad?: string): number {
  return ZONAS[zonaDe(ciudad)].eta_base_horas;
}

export interface DeliveryPromise {
  zona: Zona;
  eta_horas: number;
  etiqueta: string;
  sameDay: boolean;
}

/** Promesa de entrega al comprador según destino, modo y stock. */
export function deliveryPromise(input: {
  destino: string;
  modo: "fulfillment_tj" | "dropshipping" | "entrega_directa";
  stockConfirmado?: boolean;
  urgente?: boolean;
}): DeliveryPromise {
  const zona = zonaDe(input.destino);
  const frontera = esFronteriza(input.destino);

  // Fulfillment Tijuana: solo tiene sentido en la franja fronteriza.
  if (input.modo === "fulfillment_tj" && frontera && input.stockConfirmado) {
    const sameDay = !!input.urgente && input.destino.trim().toLowerCase() === "tijuana";
    const eta = sameDay ? 6 : input.destino.trim().toLowerCase() === "tijuana" ? 24 : 48;
    return {
      zona, eta_horas: eta, sameDay,
      etiqueta: sameDay ? "Entrega hoy (Hub Tijuana)" : eta <= 24 ? `Entrega mañana en ${input.destino}` : "Entrega 24–48h (Hub Tijuana)",
    };
  }

  // Dropshipping / entrega directa: ETA por zona del carrier.
  const base = etaBase(input.destino);
  const eta = input.modo === "entrega_directa" ? base + 12 : base;
  const dias = Math.ceil(eta / 24);
  return {
    zona, eta_horas: eta, sameDay: false,
    etiqueta: frontera ? "Entrega 24–48h" : `Entrega en ${dias} días (${zonaLabel(zona)})`,
  };
}
