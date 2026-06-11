// ────────────────────────────────────────────────────────────
// Novak — Adaptador EnvíaYa (agregador multi-carrier MX).
// Conmutable: con ENVIAYA_API_KEY golpea la API real; sin ella usa
// tarifas demo deterministas por zona para que la plataforma funcione.
// Docs: https://developers.enviaya.com.mx/docs/api/v1
// ────────────────────────────────────────────────────────────

import { etaBase, zonaDe, esFronteriza } from "@/lib/logistics/zones";
import type {
  CarrierRate,
  CreateLabelInput,
  RateQuoteInput,
  ShippingLabel,
  ShippingProvider,
  TrackingStatus,
  EstadoEnvio,
} from "@/lib/shipping/provider";

const API_BASE = "https://api.enviaya.com.mx/api/v1";
const IVA = 0.16;

function apiKey(): string | null {
  return process.env.ENVIAYA_API_KEY?.trim() || null;
}
function accountId(): string | null {
  return process.env.ENVIAYA_ACCOUNT_ID?.trim() || null;
}

// ── Demo: catálogo de carriers por zona, costo ∝ distancia/peso ──
const CARRIERS_DEMO = [
  { carrier: "Estafeta", servicio: "Día siguiente", servicio_code: "EST_NEXT", factor: 1.0, dias: 1 },
  { carrier: "Estafeta", servicio: "Económico", servicio_code: "EST_ECO", factor: 0.7, dias: 3 },
  { carrier: "FedEx", servicio: "Express", servicio_code: "FDX_EXP", factor: 1.25, dias: 1 },
  { carrier: "Paquetexpress", servicio: "Estándar", servicio_code: "PQX_STD", factor: 0.85, dias: 2 },
];

function tarifasDemo(input: RateQuoteInput): CarrierRate[] {
  const eta = etaBase(input.destino.ciudad);
  const frontera = esFronteriza(input.destino.ciudad);
  const peso = Math.max(1, input.paquete.peso_kg);
  const baseCosto = (frontera ? 90 : 140) + peso * 12 + (eta / 24) * 18;

  const rates = CARRIERS_DEMO.map((c, i) => {
    const costoNeto = baseCosto * c.factor;
    const etaHoras = Math.max(12, Math.round(eta * (c.dias <= 1 ? 0.55 : c.dias >= 3 ? 1.15 : 0.85)));
    return {
      id: `enviaya_demo_${c.servicio_code}_${i}`,
      carrier: c.carrier,
      servicio: c.servicio,
      servicio_code: c.servicio_code,
      costo: Math.round(costoNeto * (1 + IVA)),
      dias_estimados: c.dias,
      eta_horas: etaHoras,
    } as CarrierRate;
  });
  // Marcar la más barata como recomendada por defecto.
  const min = Math.min(...rates.map((r) => r.costo));
  return rates.map((r) => ({ ...r, recomendado: r.costo === min })).sort((a, b) => a.costo - b.costo);
}

async function postReal(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey(), enviaya_account: accountId(), ...(body as object) }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`EnvíaYa ${path} → ${res.status}`);
  return res.json();
}

function direccion(a: RateQuoteInput["origen"]) {
  return {
    full_name: a.nombre ?? "Novak",
    company: "Novak",
    street: a.calle ?? "",
    city: a.ciudad,
    state_code: a.estado ?? "",
    postal_code: a.cp ?? "",
    country_code: a.pais ?? "MX",
    phone: a.telefono ?? "",
  };
}

const ESTADO_MAP: Record<string, EstadoEnvio> = {
  created: "creado",
  label_created: "creado",
  picked_up: "recolectado",
  collected: "recolectado",
  in_transit: "en_transito",
  out_for_delivery: "en_transito",
  delivered: "entregado",
  exception: "incidencia",
  failed: "incidencia",
};

export const enviaYaProvider: ShippingProvider = {
  id: "enviaya",
  nombre: "EnvíaYa",
  get esDemo() {
    return !apiKey();
  },

  async cotizar(input: RateQuoteInput): Promise<CarrierRate[]> {
    if (!apiKey()) return tarifasDemo(input);
    try {
      const data = await postReal("/rates", {
        origin_direction: direccion(input.origen),
        destination_direction: direccion(input.destino),
        parcels: [
          {
            quantity: 1,
            weight: input.paquete.peso_kg,
            weight_unit: "kg",
            dimension_unit: "cm",
            length: input.paquete.largo_cm ?? 30,
            width: input.paquete.ancho_cm ?? 30,
            height: input.paquete.alto_cm ?? 30,
          },
        ],
        shipment: { insurance: 0, content_value: 0 },
      });
      const list: any[] = data?.rates ?? data ?? [];
      const rates: CarrierRate[] = list.map((r, i) => ({
        id: String(r.id ?? r.rate_id ?? `eya_${i}`),
        carrier: r.carrier ?? r.carrier_name ?? "Carrier",
        servicio: r.service_name ?? r.service ?? "Estándar",
        servicio_code: r.service_code ?? r.service ?? `S${i}`,
        costo: Math.round(Number(r.total_amount ?? r.total ?? r.amount ?? 0)),
        dias_estimados: Number(r.delivery_days ?? r.estimated_days ?? 2),
        eta_horas: Math.round(Number(r.delivery_days ?? 2) * 24),
      }));
      if (!rates.length) return tarifasDemo(input);
      const min = Math.min(...rates.map((r) => r.costo));
      return rates.map((r) => ({ ...r, recomendado: r.costo === min })).sort((a, b) => a.costo - b.costo);
    } catch {
      return tarifasDemo(input);
    }
  },

  async generarGuia(input: CreateLabelInput): Promise<ShippingLabel> {
    if (!apiKey()) {
      const pre = input.carrier.slice(0, 3).toUpperCase();
      const guia = `${pre}${Math.floor(100000 + Math.random() * 899999)}MX`;
      const eta = etaBase(input.destino.ciudad);
      return {
        guia,
        carrier: input.carrier,
        servicio: input.servicio_code,
        tracking_url: `https://rastreo.novak.mx/${guia}`,
        etiqueta_url: `https://rastreo.novak.mx/etiqueta/${guia}.pdf`,
        costo: 0,
        eta_horas: Math.round(eta * 0.85),
        carta_porte_uuid: input.conCartaPorte ? crypto.randomUUID() : undefined,
      };
    }
    try {
      const data = await postReal("/shipments", {
        rate_id: input.rateId,
        carrier: input.carrier,
        service: input.servicio_code,
        origin_direction: direccion(input.origen),
        destination_direction: direccion(input.destino),
        parcels: [{ quantity: 1, weight: input.paquete.peso_kg, weight_unit: "kg" }],
        reference: input.referencia,
      });
      return {
        guia: data?.tracking_number ?? data?.guide_number ?? "",
        carrier: data?.carrier ?? input.carrier,
        servicio: data?.service ?? input.servicio_code,
        tracking_url: data?.tracking_url ?? "",
        etiqueta_url: data?.label_url ?? data?.label ?? "",
        costo: Math.round(Number(data?.total_amount ?? 0)),
        eta_horas: Math.round(Number(data?.delivery_days ?? 2) * 24),
        carta_porte_uuid: data?.carta_porte_uuid ?? (input.conCartaPorte ? crypto.randomUUID() : undefined),
      };
    } catch {
      const guia = `ERR${Math.floor(100000 + Math.random() * 899999)}MX`;
      return {
        guia,
        carrier: input.carrier,
        servicio: input.servicio_code,
        tracking_url: "",
        etiqueta_url: "",
        costo: 0,
        eta_horas: 48,
      };
    }
  },

  async rastrear(guia: string, carrier?: string): Promise<TrackingStatus> {
    if (!apiKey()) {
      return {
        guia,
        carrier: carrier ?? "Estafeta",
        estado: "en_transito",
        eta_horas: 36,
        eventos: [
          { fecha: new Date(Date.now() - 36e5 * 20).toISOString(), estado: "creado", descripcion: "Guía generada" },
          { fecha: new Date(Date.now() - 36e5 * 12).toISOString(), estado: "recolectado", descripcion: "Recolectado por el carrier" },
          { fecha: new Date(Date.now() - 36e5 * 3).toISOString(), estado: "en_transito", descripcion: "En ruta al destino", ubicacion: "Centro de distribución" },
        ],
      };
    }
    try {
      const data = await postReal("/tracking", { tracking_number: guia, carrier });
      const eventos = (data?.events ?? []).map((e: any) => ({
        fecha: e.date ?? new Date().toISOString(),
        estado: ESTADO_MAP[String(e.status).toLowerCase()] ?? "en_transito",
        descripcion: e.description ?? "",
        ubicacion: e.location,
      }));
      return {
        guia,
        carrier: data?.carrier ?? carrier ?? "",
        estado: ESTADO_MAP[String(data?.status).toLowerCase()] ?? "en_transito",
        eventos,
      };
    } catch {
      return { guia, carrier: carrier ?? "", estado: "en_transito", eventos: [] };
    }
  },

  parseWebhook(payload: unknown): TrackingStatus | null {
    try {
      const p = payload as any;
      const guia = p?.tracking_number ?? p?.guide_number;
      if (!guia) return null;
      const estado = ESTADO_MAP[String(p?.status).toLowerCase()] ?? "en_transito";
      return {
        guia,
        carrier: p?.carrier ?? "",
        estado,
        eventos: [
          {
            fecha: p?.date ?? new Date().toISOString(),
            estado,
            descripcion: p?.description ?? `Actualización: ${estado}`,
            ubicacion: p?.location,
          },
        ],
      };
    } catch {
      return null;
    }
  },
};
