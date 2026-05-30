import { createClient } from "@/lib/supabase/server";
import { QUOTATIONS, RFQS } from "@/lib/data/account";
import { getProvider } from "@/lib/data/providers";

export interface QuoteVM {
  id: string;
  folio: string;
  rfqFolio: string;
  proveedor: string;
  ciudad: string;
  score: number;
  subtotal: number;
  comision: number;
  iva: number;
  total: number;
  tiempo_entrega_horas: number;
  condicion_pago: string;
  valida_hasta: string;
  categoria?: string;
  providerId?: string;
}

function demoVMs(): QuoteVM[] {
  return QUOTATIONS.filter((q) => q.estado === "enviada").map((q) => {
    const rfq = RFQS.find((r) => r.id === q.rfq_id);
    const prov = getProvider(q.provider_id);
    return {
      id: q.id,
      folio: q.folio,
      rfqFolio: rfq?.folio ?? q.rfq_id,
      proveedor: prov?.nombre_comercial ?? "Proveedor",
      ciudad: prov?.ciudad ?? "",
      score: prov?.score ?? 0,
      subtotal: q.subtotal,
      comision: q.comision_broker,
      iva: q.iva,
      total: q.total,
      tiempo_entrega_horas: q.tiempo_entrega_horas,
      condicion_pago: q.condicion_pago,
      valida_hasta: q.valida_hasta,
      providerId: q.provider_id,
    };
  });
}

/** Cotizaciones enviadas a una empresa (para aceptar). DB con fallback demo. */
export async function fetchQuotationVMs(companyId: string): Promise<QuoteVM[]> {
  const supabase = createClient();
  if (!supabase) return demoVMs();
  try {
    const { data, error } = await supabase
      .from("quotations")
      .select(
        "id, folio, subtotal, comision_broker, iva, total, tiempo_entrega_horas, condicion_pago, valida_hasta, provider_id, estado, rfqs!inner(folio, company_id), providers(nombre_comercial, ciudad, score)",
      )
      .eq("estado", "enviada")
      .eq("rfqs.company_id", companyId)
      .order("created_at", { ascending: false });
    if (error || !data) return demoVMs();
    return data.map((q: any) => ({
      id: q.id,
      folio: q.folio,
      rfqFolio: q.rfqs?.folio ?? "",
      proveedor: q.providers?.nombre_comercial ?? "Proveedor",
      ciudad: q.providers?.ciudad ?? "",
      score: Number(q.providers?.score ?? 0),
      subtotal: Number(q.subtotal ?? 0),
      comision: Number(q.comision_broker ?? 0),
      iva: Number(q.iva ?? 0),
      total: Number(q.total ?? 0),
      tiempo_entrega_horas: q.tiempo_entrega_horas ?? 48,
      condicion_pago: q.condicion_pago ?? "contado",
      valida_hasta: q.valida_hasta,
      providerId: q.provider_id,
    }));
  } catch {
    return demoVMs();
  }
}
