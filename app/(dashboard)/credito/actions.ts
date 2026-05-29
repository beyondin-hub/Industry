"use server";

import { createClient } from "@/lib/supabase/server";
import { getContext } from "@/lib/repos/context";
import { fetchOrders } from "@/lib/repos/orders";
import { evaluarCredito, creditProfile, canUseCredit } from "@/lib/credit/engine";
import { folio as makeFolio } from "@/lib/utils";

export interface AcceptResult { ok: boolean; folio?: string; error?: string; persisted?: boolean }

/** Acepta una cotización y genera la orden. Valida crédito si aplica. */
export async function acceptQuotation(input: {
  quotationId: string;
  total: number;
  viaCredito: boolean;
  categoria?: string;
  providerId?: string;
}): Promise<AcceptResult> {
  const ctx = await getContext();

  if (input.viaCredito) {
    const orders = await fetchOrders(ctx.company.id);
    const profile = creditProfile(ctx.company, orders);
    if (!canUseCredit(profile, input.total)) {
      return { ok: false, error: `Línea insuficiente. Disponible ${profile.disponible.toLocaleString("es-MX")} MXN.` };
    }
  }

  const numero = Math.floor(320 + Math.random() * 600);
  const folio = makeFolio("OC", numero);

  const supabase = createClient();
  if (!supabase || ctx.isDemo) {
    return { ok: true, folio, persisted: false };
  }

  try {
    const venc = input.viaCredito
      ? new Date(Date.now() + (ctx.company.dias_credito || 30) * 86_400_000).toISOString()
      : null;
    const { error } = await supabase.from("orders").insert({
      folio,
      quotation_id: input.quotationId,
      company_id: ctx.company.id,
      provider_id: input.providerId ?? null,
      categoria: input.categoria ?? null,
      estado: "confirmada",
      total: input.total,
      es_credito: input.viaCredito,
      fecha_vencimiento_credito: venc,
      pagado: !input.viaCredito,
    });
    if (error) return { ok: false, error: error.message };
    await supabase.from("quotations").update({ estado: "aceptada" }).eq("id", input.quotationId);
    return { ok: true, folio, persisted: true };
  } catch {
    return { ok: false, error: "No se pudo generar la orden." };
  }
}

/** Registra el pago de una orden a crédito. */
export async function payOrder(input: { orderId: string; monto: number }): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getContext();
  const supabase = createClient();
  if (!supabase || ctx.isDemo) return { ok: true };
  try {
    await supabase.from("payments").insert({
      order_id: input.orderId, company_id: ctx.company.id, monto: input.monto, metodo: "SPEI",
    });
    const { error } = await supabase
      .from("orders")
      .update({ pagado: true, fecha_pago: new Date().toISOString(), metodo_pago: "SPEI" })
      .eq("id", input.orderId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo registrar el pago." };
  }
}

export interface CreditDecisionResult {
  ok: boolean; aprobado: boolean; score: number; limiteSugerido: number; dias: number; razon: string;
}

/** Solicita ampliación/alta de línea de crédito. Corre el motor de scoring. */
export async function requestCreditIncrease(input: { limiteSolicitado: number }): Promise<CreditDecisionResult> {
  const ctx = await getContext();
  const orders = await fetchOrders(ctx.company.id);
  const gmv6m = orders.reduce((s, o) => s + o.total, 0);
  const antiguedadMeses = Math.max(
    1,
    Math.round((Date.now() - new Date(ctx.company.created_at).getTime()) / (30 * 86_400_000)),
  );

  const decision = evaluarCredito({
    industria: ctx.company.industria,
    antiguedadMeses,
    gmv6m,
    limiteSolicitado: input.limiteSolicitado,
  });

  const supabase = createClient();
  if (supabase && !ctx.isDemo) {
    try {
      await supabase.from("credit_requests").insert({
        company_id: ctx.company.id,
        limite_solicitado: input.limiteSolicitado,
        score: decision.score,
        limite_aprobado: decision.limiteSugerido,
        dias: decision.dias,
        estado: decision.aprobado ? "aprobado" : "pendiente",
        razon: decision.razon,
        resuelto_at: decision.aprobado ? new Date().toISOString() : null,
      });
    } catch { /* demo */ }
  }

  return { ok: true, ...decision };
}
