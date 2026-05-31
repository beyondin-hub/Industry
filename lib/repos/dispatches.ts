import { createClient } from "@/lib/supabase/server";
import { DISPATCHES, type DispatchInstruction } from "@/lib/data/dispatches";

/** Despachos de un proveedor (portal proveedor) o todos (admin). */
export async function fetchDispatches(providerId?: string): Promise<DispatchInstruction[]> {
  const supabase = createClient();
  if (!supabase) {
    return providerId ? DISPATCHES.filter((d) => d.provider_id === providerId) : DISPATCHES;
  }
  try {
    let query = supabase
      .from("dispatch_instructions")
      .select("*")
      .order("created_at", { ascending: false });
    if (providerId) query = query.eq("provider_id", providerId);
    const { data, error } = await query.limit(200);
    if (error || !data || data.length === 0) {
      return providerId ? DISPATCHES.filter((d) => d.provider_id === providerId) : DISPATCHES;
    }
    return data.map((d: any) => ({
      id: d.id,
      order_id: d.order_id,
      provider_id: d.provider_id,
      folio: d.folio ?? "",
      destino: d.destino ?? "—",
      empresa: d.empresa ?? "—",
      carrier: d.carrier ?? "",
      guia: d.guia ?? "",
      etiqueta_url: d.etiqueta_url ?? "",
      estado: d.estado ?? "pendiente",
      deadline: d.deadline,
      evidencia_url: d.evidencia_url ?? undefined,
      confirmado_at: d.confirmado_at ?? undefined,
      sla_horas: d.sla_horas ?? undefined,
      created_at: d.created_at,
    }));
  } catch {
    return providerId ? DISPATCHES.filter((d) => d.provider_id === providerId) : DISPATCHES;
  }
}
