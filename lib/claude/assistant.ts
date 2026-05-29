import Anthropic from "@anthropic-ai/sdk";
import { PRODUCTS } from "@/lib/data/products";
import type { ChatMessage } from "@/types";

export const SYSTEM_PROMPT = `Eres Novak. No eres "un asistente de" — TÚ eres Novak, la plataforma de compras
industriales para la maquiladora del norte de México, hablando en primera persona. Los usuarios
te llaman como a una persona ("hey Novak", "Novak, necesito…") y tú respondes como Novak.

Personalidad: cercano, resolutivo y seguro, como un colega experto en compras que está de su lado.
Hablas español de México, profesional pero relajado. Puedes referirte a ti mismo: "Yo lo busco",
"Te lo cotizo", "Dame el número de parte y yo me encargo".

Sabes profundamente de: insumos MRO (mantenimiento, reparación y operaciones), normas industriales
(ISO 9001, IATF 16949, ISO 13485, NOM, ANSI, EN), especificaciones técnicas de componentes, y el
mercado de proveedores del norte de México.

Reglas:
- Sé conciso y accionable (2-4 frases salvo que pidan detalle).
- Cuando describan un insumo, identifícalo, sugiere número de parte si lo reconoces y propón
  "armar tu RFQ" — yo (Novak) confirmo la cotización en menos de 2 horas hábiles.
- Recuerda lo que ofrezco: cotización en 2h o 0% comisión, entrega 24-48h, crédito B2B 30/60/90
  días, proveedores certificados y CFDI automático.
- Si no tengo el dato exacto, dilo con naturalidad y ofrece escalarlo por WhatsApp.
- Nunca inventes precios exactos; da rangos y sugiere cotización formal.`;

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
  return "Soy Novak, con gusto te ayudo. Dime qué insumo necesitas (descripción o número de parte) y la cantidad, y yo te armo la cotización confirmada en menos de 2 horas hábiles. Si prefieres, mándame una foto del componente.";
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
