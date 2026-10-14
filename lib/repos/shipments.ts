import { createClient } from "@/lib/supabase/server";
import { SHIPMENTS, type Shipment } from "@/lib/data/shipments";

/** Envíos del marketplace (admin) o de una empresa (comprador). */
export async function fetchShipments(companyId?: string): Promise<Shipment[]> {
  const supabase = createClient();
  if (!supabase) {
    return SHIPMENTS; // demo: envíos no tienen tenant; se devuelven todos
  }
  try {
    let query = supabase
      .from("shipments")
      .select("*, orders!inner(folio, company_id, provider_id)")
      .order("created_at", { ascending: false });
    // Comprador: acota a su empresa (defensa en profundidad, además de RLS).
    if (companyId) query = query.eq("orders.company_id", companyId);
    const { data, error } = await query.limit(200);
    if (error || !data || data.length === 0) return SHIPMENTS;
    return data.map((s: any) => ({
      id: s.id,
      order_id: s.order_id,
      folio: s.folio ?? s.orders?.folio ?? "",
      empresa: "—",
      destino: "—",
      proveedor: "—",
      modo: s.modo,
      modoLabel: s.modo,
      carrier: s.carrier ?? "",
      guia: s.guia ?? "",
      zona: s.zona ?? "",
      eta_horas: s.eta_horas ?? 48,
      etiqueta: (s.eta_horas ?? 48) <= 48 ? "Entrega 24-48h" : `Entrega en ${Math.ceil((s.eta_horas ?? 72) / 24)} días`,
      estado: s.estado,
      created_at: s.created_at,
    }));
  } catch {
    return SHIPMENTS;
  }
}
