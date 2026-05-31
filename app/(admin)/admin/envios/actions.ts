"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

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

/** Genera la guía + Carta Porte (stub conmutable: real al conectar carrier+PAC). */
export async function generateGuide(input: { shipmentId: string; folio: string }): Promise<{ ok: boolean; guia?: string; cartaPorte?: string; error?: string }> {
  const guia = `NVK${Math.floor(100000 + Math.random() * 899999)}MX`;
  const cartaPorte = crypto.randomUUID();
  const supabase = createClient();
  if (supabase) {
    try { await supabase.from("shipments").update({ guia, carta_porte_uuid: cartaPorte, updated_at: new Date().toISOString() }).eq("id", input.shipmentId); } catch { /* demo */ }
  }
  await logAudit({ accion: "shipment.guide", entidad: "shipment", entidad_id: input.folio, detalle: `Guía ${guia}` });
  return { ok: true, guia, cartaPorte };
}
