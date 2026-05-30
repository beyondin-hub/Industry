"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

const ESTADOS = ["confirmada", "en_preparacion", "en_transito", "entregada", "cancelada"];

export async function updateOrderStatus(input: { orderId: string; folio: string; estado: string }): Promise<{ ok: boolean; error?: string }> {
  if (!ESTADOS.includes(input.estado)) return { ok: false, error: "Estado inválido." };
  const supabase = createClient();
  if (!supabase) {
    await logAudit({ accion: "order.update_status", entidad: "order", entidad_id: input.folio, detalle: `→ ${input.estado}` });
    return { ok: true };
  }
  try {
    const patch: Record<string, unknown> = { estado: input.estado };
    if (input.estado === "entregada") patch.entregada_at = new Date().toISOString();
    const { error } = await supabase.from("orders").update(patch).eq("id", input.orderId);
    if (error) return { ok: false, error: error.message };
    await logAudit({ accion: "order.update_status", entidad: "order", entidad_id: input.folio, detalle: `→ ${input.estado}` });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar la orden." };
  }
}
