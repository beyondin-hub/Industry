import { createClient } from "@/lib/supabase/server";
import { ORDERS } from "@/lib/data/account";
import type { Order } from "@/types";

function mapOrder(row: any): Order {
  return {
    id: row.id,
    folio: row.folio ?? row.id.slice(0, 8),
    quotation_id: row.quotation_id ?? "",
    company_id: row.company_id,
    estado: row.estado,
    total: Number(row.total ?? 0),
    es_credito: row.es_credito ?? false,
    fecha_vencimiento_credito: row.fecha_vencimiento_credito ?? undefined,
    tracking_url: row.tracking_url ?? undefined,
    cfdi_url: row.cfdi_url ?? undefined,
    cfdi_uuid: row.cfdi_uuid ?? undefined,
    notas_entrega: row.notas_entrega ?? undefined,
    categoria: row.categoria,
    provider_id: row.provider_id,
    created_at: row.created_at,
    entregada_at: row.entregada_at ?? undefined,
  };
}

export async function fetchOrders(companyId?: string): Promise<Order[]> {
  const supabase = createClient();
  if (!supabase) {
    return companyId ? ORDERS.filter((o) => o.company_id === companyId) : ORDERS;
  }
  try {
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (companyId) query = query.eq("company_id", companyId);
    const { data, error } = await query.limit(100);
    if (error || !data) throw error;
    return data.map(mapOrder);
  } catch {
    return companyId ? ORDERS.filter((o) => o.company_id === companyId) : ORDERS;
  }
}
