import { createClient } from "@/lib/supabase/server";
import { RFQS } from "@/lib/data/account";
import type { RFQ, RFQItem } from "@/types";

function mapRFQ(row: any): RFQ {
  return {
    id: row.id,
    folio: row.folio ?? row.id.slice(0, 8),
    buyer_id: row.buyer_id,
    company_id: row.company_id,
    estado: row.estado,
    urgencia: row.urgencia,
    condicion_pago: row.condicion_pago,
    requiere_cfdi: row.requiere_cfdi,
    notas: row.notas ?? undefined,
    total_estimado: Number(row.total_estimado ?? 0),
    created_at: row.created_at,
    deadline_cotizacion: row.deadline_cotizacion,
    items: (row.rfq_items ?? []).map(
      (it: any): RFQItem => ({
        id: it.id,
        rfq_id: it.rfq_id,
        product_id: it.product_id ?? undefined,
        descripcion: it.descripcion,
        numero_parte: it.numero_parte ?? undefined,
        cantidad: it.cantidad,
        unidad: it.unidad ?? "pza",
        certificacion_requerida: it.certificacion_requerida ?? undefined,
        imagen_url: it.imagen_url ?? undefined,
      }),
    ),
  };
}

/** RFQ de una empresa. En modo admin (sin companyId) trae todos. */
export async function fetchRFQs(companyId?: string): Promise<RFQ[]> {
  const supabase = createClient();
  if (!supabase) {
    return companyId ? RFQS.filter((r) => r.company_id === companyId) : RFQS;
  }
  try {
    let query = supabase
      .from("rfqs")
      .select("*, rfq_items(*)")
      .order("created_at", { ascending: false });
    if (companyId) query = query.eq("company_id", companyId);
    const { data, error } = await query.limit(100);
    if (error || !data) throw error;
    return data.map(mapRFQ);
  } catch {
    return companyId ? RFQS.filter((r) => r.company_id === companyId) : RFQS;
  }
}
