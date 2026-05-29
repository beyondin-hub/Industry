import { Resend } from "resend";

/**
 * Envío de email transaccional vía Resend (CFDI, cotizaciones, confirmaciones).
 * Degrada a no-op con log si no hay API key (modo demo).
 */
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ ok: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "cotizaciones@mrolink.mx";
  if (!apiKey) {
    console.info(`[Email demo] → ${opts.to}: ${opts.subject}`);
    return { ok: true };
  }
  try {
    const resend = new Resend(apiKey);
    const { data } = await resend.emails.send({
      from: `MROLink <${from}>`,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
    });
    return { ok: true, id: data?.id };
  } catch {
    return { ok: false };
  }
}

// Plantillas de email reutilizables.
export const emailTemplates = {
  rfqRecibido: (folio: string, items: number) => ({
    subject: `Recibimos tu solicitud ${folio} — cotización en 2h`,
    html: `<div style="font-family:system-ui,sans-serif;color:#0D0C0A">
      <h2 style="font-weight:800">MROLink</h2>
      <p>Recibimos tu solicitud de cotización <strong>${folio}</strong> con ${items} partida(s).</p>
      <p>Nuestra mesa de operaciones la está procesando. Recibirás la cotización en
      <strong>menos de 2 horas hábiles</strong> — o tu siguiente orden va con 0% de comisión.</p>
    </div>`,
  }),
  cotizacionLista: (folio: string, total: string) => ({
    subject: `Tu cotización ${folio} está lista — ${total}`,
    html: `<div style="font-family:system-ui,sans-serif;color:#0D0C0A">
      <h2 style="font-weight:800">MROLink</h2>
      <p>Tu cotización <strong>${folio}</strong> está lista. Total: <strong>${total}</strong>.</p>
      <p>Ingresa a la plataforma para revisarla y aprobarla.</p>
    </div>`,
  }),
};
