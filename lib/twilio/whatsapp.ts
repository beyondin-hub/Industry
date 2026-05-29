/**
 * Notificaciones por WhatsApp vía Twilio.
 * En el MVP demo, si no hay credenciales, registra en consola y resuelve OK.
 */
export interface WhatsAppMessage {
  to: string; // E.164, ej. +526641234567
  body: string;
}

export async function sendWhatsApp({ to, body }: WhatsAppMessage): Promise<{ ok: boolean; sid?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !token || !from) {
    console.info(`[WhatsApp demo] → ${to}: ${body}`);
    return { ok: true };
  }

  const params = new URLSearchParams({
    To: `whatsapp:${to}`,
    From: from,
    Body: body,
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    },
  );
  const data = await res.json();
  return { ok: res.ok, sid: data.sid };
}

// Plantillas de los 5 flujos automatizados de WhatsApp.
export const waTemplates = {
  // 1. Bienvenida al registrarse.
  bienvenida: (nombre: string) =>
    `👋 ¡Hola ${nombre}! Bienvenido a MROLink, tu equipo de compras externo. Mándanos un número de parte o una foto del componente y te cotizamos en menos de 2 horas hábiles.`,
  // RFQ recibido (confirmación inmediata).
  rfqRecibido: (folio: string) =>
    `✅ MROLink recibió tu solicitud ${folio}. Cotización garantizada en menos de 2 horas hábiles o tu siguiente orden va con 0% de comisión.`,
  // 2. Cotización lista.
  cotizacionLista: (folio: string, total: string) =>
    `🔧 MROLink: Tu cotización ${folio} está lista. Total: ${total}. Entra a la plataforma para aprobar 👉`,
  // 3. Orden en tránsito.
  ordenEnTransito: (folio: string, eta: string) =>
    `🚚 MROLink: Tu orden ${folio} ya va en camino. ETA: ${eta}.`,
  // 4. Reorden (recordatorio antes de quedarse sin stock).
  reorden: (producto: string, vence: string) =>
    `🔁 ¡Hola! Tus ${producto} se agotan ~${vence}. ¿Reordenamos con 5% de descuento? Responde SÍ para confirmar.`,
  // 5. Crédito por vencer.
  creditoVence: (monto: string, dias: number) =>
    `💳 MROLink: Tu línea de crédito de ${monto} vence en ${dias} días. Programa tu pago para conservar el cupo.`,
};
