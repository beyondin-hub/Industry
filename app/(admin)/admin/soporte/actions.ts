"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { redactContact } from "@/lib/anti-bypass";

export async function replyTicket(input: { ticketId: string; asunto: string; cuerpo: string }): Promise<{ ok: boolean; cuerpo?: string; redactado?: boolean; error?: string }> {
  const cuerpo = input.cuerpo.trim();
  if (!cuerpo) return { ok: false, error: "Mensaje vacío." };
  const { limpio, redactado } = redactContact(cuerpo);

  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("ticket_messages").insert({ ticket_id: input.ticketId, remitente: "novak", cuerpo: limpio, redactado });
      await supabase.from("support_tickets").update({ estado: "en_proceso", updated_at: new Date().toISOString() }).eq("id", input.ticketId);
    } catch { /* demo */ }
  }
  await logAudit({ accion: "support.reply", entidad: "ticket", entidad_id: input.asunto });
  return { ok: true, cuerpo: limpio, redactado };
}

export async function setTicketStatus(input: { ticketId: string; asunto: string; estado: "abierto" | "en_proceso" | "resuelto" }): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (supabase) {
    try { await supabase.from("support_tickets").update({ estado: input.estado, updated_at: new Date().toISOString() }).eq("id", input.ticketId); } catch { /* demo */ }
  }
  await logAudit({ accion: "support.status", entidad: "ticket", entidad_id: input.asunto, detalle: `→ ${input.estado}` });
  return { ok: true };
}
