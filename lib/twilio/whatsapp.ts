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

// Plantillas de notificación reutilizables.
export const waTemplates = {
  cotizacionLista: (folio: string, resumen: string) =>
    `🔧 MROLink: Tu cotización ${folio} está lista. ${resumen} Entra a la plataforma para aprobar.`,
  rfqRecibido: (folio: string) =>
    `✅ MROLink recibió tu solicitud ${folio}. Cotización garantizada en menos de 2 horas hábiles.`,
  ordenEnTransito: (folio: string, eta: string) =>
    `🚚 MROLink: Tu orden ${folio} va en camino. Entrega estimada: ${eta}.`,
};
