import { createClient } from "@/lib/supabase/server";
import { TICKETS, type Ticket } from "@/lib/data/admin";

export async function fetchTickets(): Promise<Ticket[]> {
  const supabase = createClient();
  if (!supabase) return TICKETS;
  try {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*, ticket_messages(remitente, cuerpo, created_at)")
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return TICKETS;
    return data.map((t: any) => ({
      id: t.id,
      asunto: t.asunto,
      tipo: t.tipo,
      origen: t.origen,
      origen_nombre: t.origen_nombre ?? "",
      prioridad: t.prioridad,
      estado: t.estado,
      created_at: t.created_at,
      mensajes: (t.ticket_messages ?? []).sort((a: any, b: any) => a.created_at.localeCompare(b.created_at)),
    }));
  } catch {
    return TICKETS;
  }
}
