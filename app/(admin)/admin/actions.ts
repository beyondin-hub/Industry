"use server";

import { createClient } from "@/lib/supabase/server";
import { desgloseCotizacion } from "@/lib/credit/engine";
import { folio as makeFolio } from "@/lib/utils";
import { sendWhatsApp, waTemplates } from "@/lib/twilio/whatsapp";
import { sendEmail, emailTemplates } from "@/lib/resend/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://heynovak.com";

/** Notifica al proveedor por WhatsApp + email el resultado de su solicitud. */
async function notificarProveedor(
  contacto: { nombre: string; email?: string | null; telefono?: string | null },
  resultado: "aprobado" | "rechazado",
) {
  const tareas: Promise<unknown>[] = [];
  if (contacto.telefono) {
    const body = resultado === "aprobado"
      ? waTemplates.proveedorAprobado(contacto.nombre)
      : waTemplates.proveedorRechazado(contacto.nombre);
    tareas.push(sendWhatsApp({ to: contacto.telefono, body }).catch(() => {}));
  }
  if (contacto.email) {
    const tpl = resultado === "aprobado"
      ? emailTemplates.proveedorAprobado(contacto.nombre, APP_URL)
      : emailTemplates.proveedorRechazado(contacto.nombre);
    tareas.push(sendEmail({ to: contacto.email, ...tpl }).catch(() => {}));
  }
  await Promise.all(tareas);
}

export interface CreateQuoteResult {
  ok: boolean;
  folio?: string;
  desglose?: { subtotal: number; comision: number; iva: number; total: number };
  error?: string;
  persisted?: boolean;
}

/**
 * La mesa de operaciones arma la cotización para un RFQ: define precios por
 * partida, proveedor y comisión, y genera el quote que el comprador acepta.
 */
export async function createQuotation(input: {
  rfqId: string;
  providerId: string;
  subtotal: number;
  comisionPct: number;
  tiempoEntregaHoras: number;
  condicionPago: string;
}): Promise<CreateQuoteResult> {
  if (!input.subtotal || input.subtotal <= 0) {
    return { ok: false, error: "Captura los precios de las partidas." };
  }
  const desglose = desgloseCotizacion(input.subtotal, input.comisionPct);
  const numero = Math.floor(210 + Math.random() * 700);
  const folio = makeFolio("COT", numero);

  const supabase = createClient();
  if (!supabase) {
    return { ok: true, folio, desglose, persisted: false };
  }
  try {
    const { error } = await supabase.from("quotations").insert({
      folio,
      rfq_id: input.rfqId,
      provider_id: input.providerId,
      estado: "enviada",
      subtotal: desglose.subtotal,
      comision_broker: desglose.comision,
      iva: desglose.iva,
      total: desglose.total,
      tiempo_entrega_horas: input.tiempoEntregaHoras,
      condicion_pago: input.condicionPago,
      valida_hasta: new Date(Date.now() + 3 * 86_400_000).toISOString(),
    });
    if (error) return { ok: false, error: error.message };
    await supabase.from("rfqs").update({ estado: "cotizado" }).eq("id", input.rfqId);
    return { ok: true, folio, desglose, persisted: true };
  } catch {
    return { ok: false, error: "No se pudo generar la cotización." };
  }
}

/** Aprueba una solicitud de proveedor: activa su cuenta y le avisa. */
export async function approveProvider(input: { providerId: string }): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { ok: true }; // demo (sin BD/contacto)
  try {
    const { data, error } = await supabase
      .from("providers")
      .update({ estado: "aprobado", stock_confirmado: true })
      .eq("id", input.providerId)
      .select("nombre_comercial, email, telefono")
      .single();
    if (error) return { ok: false, error: error.message };
    if (data) {
      await notificarProveedor(
        { nombre: data.nombre_comercial, email: data.email, telefono: data.telefono },
        "aprobado",
      );
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo aprobar al proveedor." };
  }
}

/** Rechaza una solicitud de proveedor y le avisa. */
export async function rejectProvider(input: { providerId: string; motivo?: string }): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { ok: true }; // demo
  try {
    const { data, error } = await supabase
      .from("providers")
      .update({ estado: "suspendido", activo: false })
      .eq("id", input.providerId)
      .select("nombre_comercial, email, telefono")
      .single();
    if (error) return { ok: false, error: error.message };
    if (data) {
      await notificarProveedor(
        { nombre: data.nombre_comercial, email: data.email, telefono: data.telefono },
        "rechazado",
      );
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo rechazar la solicitud." };
  }
}

/** Dispersa el pago al proveedor (tesorería). */
export async function dispersarPago(input: { orderId: string; providerId: string; monto: number }): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) return { ok: true };
  try {
    const { error } = await supabase.from("provider_payouts").insert({
      order_id: input.orderId,
      provider_id: input.providerId,
      monto: input.monto,
      estado: "dispersado",
      dispersado_at: new Date().toISOString(),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo dispersar el pago." };
  }
}
