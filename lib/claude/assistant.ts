import Anthropic from "@anthropic-ai/sdk";
import { PRODUCTS } from "@/lib/data/products";
import type { ChatMessage } from "@/types";

export const SYSTEM_PROMPT = `Eres el Asistente de Compras de MROLink, el broker digital de insumos MRO
(mantenimiento, reparación y operaciones) para la industria maquiladora del norte de México.

Tu objetivo es ayudar a gerentes y jefes de compras a resolver necesidades de suministro
rápido, con foco en evitar paros de línea. Hablas español de México, profesional pero cercano.

Reglas:
- Sé conciso y accionable. Respuestas de 2-4 frases salvo que pidan detalle.
- Cuando el usuario describa un insumo, ayúdale a identificar el producto, sugiere número de
  parte si lo reconoces y propón crear un RFQ (cotización) que se confirma en menos de 2 horas hábiles.
- Recuerda los diferenciadores: cotización en 2h o 0% comisión, entrega 24-48h, crédito B2B
  30/60/90 días, proveedores certificados (ISO 9001, IATF 16949), y CFDI automático.
- Si no tienes el dato exacto, dilo y ofrece escalar con un especialista por WhatsApp.
- Nunca inventes precios exactos; da rangos y sugiere solicitar cotización formal.`;

const CATALOG_HINT = PRODUCTS.slice(0, 12)
  .map((p) => `- ${p.nombre} (N/P ${p.numero_parte}, ${p.marca}, ~$${p.precio_base} MXN)`)
  .join("\n");

/** Respuesta de respaldo si no hay API key configurada (modo demo). */
function fallbackReply(messages: ChatMessage[]): string {
  const last = messages[messages.length - 1]?.content.toLowerCase() ?? "";
  if (/balero|6205|rodamiento/.test(last)) {
    return "Perfecto. El balero 6205-2RS (SKF) lo tenemos con stock confirmado en Tijuana, entrega mañana. Puedo armarte un RFQ con la cantidad que necesites y te confirmo precio en menos de 2 horas hábiles. ¿Cuántas piezas?";
  }
  if (/guante|epp|seguridad/.test(last)) {
    return "Para ensamble te recomiendo el guante de nitrilo recubierto (Ansell, EN 388 4131): buen agarre y resistencia a la abrasión. ¿Qué tallas y volumen mensual manejas? Lo cotizo con descuento por volumen.";
  }
  if (/grasa|lubricante|aceite/.test(last)) {
    return "La grasa EP2 a base de litio (Mobil, NLGI 2) es ideal para rodamientos y chumaceras. Tenemos stock y puedes pagarla a crédito 60 días. ¿Quieres que prepare la cotización?";
  }
  if (/credito|crédito|pago|factura|cfdi/.test(last)) {
    return "Sí: ofrecemos crédito B2B preaprobado a 30, 60 o 90 días vía nuestro partner SOFOM, y emitimos CFDI automático en cada compra. ¿Te ayudo a iniciar la solicitud de línea de crédito?";
  }
  return "Con gusto te ayudo. Cuéntame qué insumo necesitas (descripción o número de parte) y la cantidad, y te preparo una cotización confirmada en menos de 2 horas hábiles. Si prefieres, también puedes mandarme una foto del componente.";
}

export async function getAssistantReply(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackReply(messages);

  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: `${SYSTEM_PROMPT}\n\nMuestra del catálogo disponible:\n${CATALOG_HINT}`,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return text || fallbackReply(messages);
  } catch {
    return fallbackReply(messages);
  }
}
