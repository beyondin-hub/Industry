// ────────────────────────────────────────────────────────────
// Mecanismos anti-desintermediación (que el proveedor no "brinque"
// a Novak y le venda directo a la maquiladora).
//
// Estrategia (defensa en capas):
//  1. Identidad del comprador SIEMPRE enmascarada para el proveedor:
//     nunca ve nombre, RFC, contacto ni dirección de la maquila.
//  2. Comunicación 100% dentro de la plataforma: se redacta cualquier
//     teléfono/email/URL en los mensajes (no se puede compartir contacto).
//  3. Novak es el de la relación fiscal y de crédito: el proveedor le
//     factura a Novak (no a la maquila) y Novak le paga. Sin datos del
//     cliente final, el brinco es estructuralmente difícil.
//  4. Cláusula de no-circunvención aceptada en el alta.
//  5. En fulfillment/entrega gestionada, el proveedor ni siquiera conoce
//     la dirección de entrega (va al almacén Novak o lo despacha Novak).
// ────────────────────────────────────────────────────────────

export interface MaskedBuyer {
  etiqueta: string;
  industria: string;
  ciudad: string;
  volumen: string;
}

/** Convierte una empresa real en su identidad pública para el proveedor. */
export function maskBuyer(input: {
  industria?: string;
  ciudad?: string;
  volumenMensual?: string;
}): MaskedBuyer {
  const industria = input.industria ?? "manufactura";
  const ciudad = input.ciudad ?? "Norte de México";
  return {
    etiqueta: "Comprador verificado por Novak",
    industria,
    ciudad,
    volumen: input.volumenMensual ?? "recurrente",
  };
}

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/g;
const URL = /\b((https?:\/\/)|(www\.))[^\s]+/gi;

/**
 * Redacta datos de contacto en un mensaje (para la mensajería interna
 * comprador↔proveedor). Evita que se filtren teléfonos/emails/URLs.
 */
export function redactContact(text: string): { limpio: string; redactado: boolean } {
  let redactado = false;
  const marca = "[oculto por política Novak]";
  let limpio = text
    .replace(EMAIL, () => ((redactado = true), marca))
    .replace(URL, () => ((redactado = true), marca))
    .replace(PHONE, (m) => (m.replace(/\D/g, "").length >= 9 ? ((redactado = true), marca) : m));
  return { limpio, redactado };
}
