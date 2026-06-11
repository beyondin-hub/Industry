"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { getShippingProvider } from "@/lib/shipping";

const ESTADOS = ["creado", "recolectado", "en_transito", "entregado", "incidencia"];

export async function updateShipmentStatus(input: { shipmentId: string; folio: string; estado: string; nota?: string }): Promise<{ ok: boolean; error?: string }> {
  if (!ESTADOS.includes(input.estado)) return { ok: false, error: "Estado inválido." };
  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("shipments").update({ estado: input.estado, updated_at: new Date().toISOString() }).eq("id", input.shipmentId);
      await supabase.from("shipment_events").insert({ shipment_id: input.shipmentId, estado: input.estado, nota: input.nota ?? null });
    } catch { /* demo */ }
  }
  await logAudit({ accion: "shipment.update", entidad: "shipment", entidad_id: input.folio, detalle: `→ ${input.estado}` });
  return { ok: true };
}

/** Genera la guía + Carta Porte vía el agregador (EnvíaYa). Conmutable: real con API key, demo sin ella. */
export async function generateGuide(input: {
  shipmentId: string;
  folio: string;
  carrier?: string;
  servicio_code?: string;
  origen?: string;
  destino?: string;
  peso_kg?: number;
}): Promise<{ ok: boolean; guia?: string; cartaPorte?: string; etiquetaUrl?: string; error?: string }> {
  const provider = getShippingProvider();
  const label = await provider.generarGuia({
    carrier: input.carrier ?? "Estafeta",
    servicio_code: input.servicio_code ?? "EST_NEXT",
    origen: { ciudad: input.origen ?? "Tijuana" },
    destino: { ciudad: input.destino ?? "Monterrey" },
    paquete: { peso_kg: input.peso_kg ?? 5 },
    referencia: input.folio,
    conCartaPorte: true,
  });
  const supabase = createClient();
  if (supabase) {
    try {
      await supabase
        .from("shipments")
        .update({
          guia: label.guia,
          carrier: label.carrier,
          carta_porte_uuid: label.carta_porte_uuid ?? null,
          etiqueta_url: label.etiqueta_url,
          tracking_url: label.tracking_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.shipmentId);
    } catch { /* demo */ }
  }
  await logAudit({ accion: "shipment.guide", entidad: "shipment", entidad_id: input.folio, detalle: `${label.carrier} · guía ${label.guia}` });
  return { ok: true, guia: label.guia, cartaPorte: label.carta_porte_uuid, etiquetaUrl: label.etiqueta_url };
}
