import { NextResponse } from "next/server";
import { getAssistantReply } from "@/lib/claude/assistant";
import { searchProducts } from "@/lib/data/products";
import type { ChatMessage } from "@/types";

export const runtime = "nodejs";

// Rate limiting básico en memoria por IP (protege créditos de la API de Claude).
const HITS = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;

function rateLimited(ip: string) {
  const now = Date.now();
  const rec = HITS.get(ip);
  if (!rec || now - rec.ts > WINDOW_MS) {
    HITS.set(ip, { count: 1, ts: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

const STOP = new Set(["necesito", "cotizar", "cotiza", "para", "una", "unos", "unas", "con", "los", "las", "que", "por", "urgente", "urgentes", "quiero", "comprar", "pedir", "ordenar", "requiero", "favor", "porfa"]);

function productCards(text: string) {
  // Tokeniza el mensaje y puntúa cada producto por coincidencias de token
  // (número de parte, marca, nombre). Más robusto que el substring completo.
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9áéíóúñ-]+/i)
    .filter((t) => t.length >= 2 && !STOP.has(t));
  if (tokens.length === 0) return [];

  const scored = searchProducts("")
    .map((p) => {
      const hay = `${p.nombre} ${p.numero_parte} ${p.marca} ${p.subcategoria}`.toLowerCase();
      const score = tokens.reduce((s, t) => (hay.includes(t) ? s + 1 : s), 0);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p);

  return scored.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    numero_parte: p.numero_parte,
    marca: p.marca,
    precio_base: p.precio_base,
    unidad: p.unidad,
    tiempo_entrega_horas: p.tiempo_entrega_horas,
    stock_actual: p.stock_actual,
  }));
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
    if (rateLimited(ip)) {
      return NextResponse.json(
        { reply: "Estás enviando muchos mensajes muy rápido. Espera un momento y reintenta. 🙏" },
        { status: 429 },
      );
    }

    const body = (await req.json()) as { messages?: ChatMessage[] };
    const messages = (body.messages ?? []).filter(
      (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    );
    if (messages.length === 0) {
      return NextResponse.json({ reply: "¿En qué insumo MRO te puedo ayudar hoy?" });
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const products = productCards(lastUser);
    const suggestRFQ = /cotiz|necesito|comprar|pedir|ordenar|requiero|urgente|surt/i.test(lastUser);

    const reply = await getAssistantReply(messages.slice(-12));
    return NextResponse.json({ reply, products, suggestRFQ });
  } catch {
    return NextResponse.json(
      { reply: "Tuve un problema procesando tu mensaje. Escríbenos por WhatsApp y te atendemos al instante." },
      { status: 200 },
    );
  }
}
