import { createClient } from "@/lib/supabase/server";
import { CREDIT_REQUESTS, type CreditRequest } from "@/lib/data/admin";

/** Solicitudes de crédito pendientes (bandeja del admin). */
export async function fetchCreditRequests(): Promise<CreditRequest[]> {
  const supabase = createClient();
  if (!supabase) return CREDIT_REQUESTS;
  try {
    const { data, error } = await supabase
      .from("credit_requests")
      .select("id, company_id, limite_solicitado, estado, created_at, companies(nombre, industria, ciudad)")
      .eq("estado", "pendiente")
      .order("created_at", { ascending: true });
    if (error || !data || data.length === 0) return CREDIT_REQUESTS;
    return data.map((r: any) => ({
      id: r.id,
      company_id: r.company_id,
      empresa: r.companies?.nombre ?? "Empresa",
      industria: r.companies?.industria ?? "metalmecanica",
      ciudad: r.companies?.ciudad ?? "Tijuana",
      limite_solicitado: Number(r.limite_solicitado ?? 0),
      gmv6m: 0,
      antiguedad_meses: 6,
      estado: r.estado,
      created_at: r.created_at,
    }));
  } catch {
    return CREDIT_REQUESTS;
  }
}
