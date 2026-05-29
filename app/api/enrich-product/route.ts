import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

// Marcas conocidas para detección heurística.
const MARCAS = ["SKF", "NSK", "FAG", "Festo", "SMC", "3M", "Ansell", "Mobil", "Shell", "Castrol", "DeWalt", "Mitutoyo", "Parker", "Omron", "Schneider", "Siemens", "Norton", "Gates", "Bosch", "Fastenal", "Donaldson", "FYH", "Zep"];

// Palabras clave → categoría.
const CAT_KEYWORDS: Record<string, string[]> = {
  rodamientos: ["balero", "rodamiento", "chumacera", "banda", "polea", "6205", "6203", "ucp"],
  epp: ["guante", "lente", "respirador", "casco", "tapon", "epp", "n95", "z87"],
  lubricantes: ["grasa", "aceite", "lubricante", "desengrasante", "solvente", "ep2", "iso 46"],
  herramientas: ["taladro", "calibrador", "llave", "vernier", "torquimetro", "destornillador"],
  neumatica: ["cilindro", "valvula", "neumatic", "manguera", "racor", "frl"],
  electrico: ["sensor", "relevador", "contactor", "cable", "fuente", "plc", "inductivo"],
  abrasivos: ["disco", "lija", "abrasivo", "rueda", "corte"],
  sujetadores: ["tornillo", "tuerca", "rondana", "ancla", "remache", "m8", "m6"],
  sellos: ["o-ring", "oring", "reten", "junta", "empaque", "sello"],
  filtros: ["filtro", "elemento filtrante"],
};

function detectCategoria(text: string): string {
  const t = text.toLowerCase();
  for (const [cat, kws] of Object.entries(CAT_KEYWORDS)) {
    if (kws.some((k) => t.includes(k))) return cat;
  }
  return "herramientas";
}
function detectMarca(text: string): string {
  const found = MARCAS.find((m) => text.toLowerCase().includes(m.toLowerCase()));
  return found ?? "";
}
function detectNP(text: string): string {
  const m = text.match(/[A-Z0-9]+(?:[-/][A-Z0-9]+)+/i);
  return m ? m[0] : "";
}

// Enriquecimiento heurístico (sin IA): estructura y completa cada línea.
function heuristicEnrich(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 50)
    .map((line) => {
      const categoria = detectCategoria(line);
      const marca = detectMarca(line);
      const numero_parte = detectNP(line);
      const nombre = line.replace(/\s{2,}/g, " ").slice(0, 90);
      return {
        nombre: nombre || "Producto sin nombre",
        numero_parte,
        marca,
        categoria,
        unidad: "pza",
        descripcion: `${nombre}. Ficha generada automáticamente; verifica especificaciones antes de publicar.`,
        especificaciones: {},
        certificaciones: [] as string[],
        confianza: marca && numero_parte ? "alta" : numero_parte ? "media" : "baja",
        fuente: "heuristica",
      };
    });
}

export async function POST(req: Request) {
  try {
    const { raw } = (await req.json()) as { raw?: string };
    if (!raw || !raw.trim()) {
      return NextResponse.json({ products: [] });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ products: heuristicEnrich(raw), enriched_by: "heuristica" });
    }

    // Enriquecimiento con Claude: estructura + completa la ficha de cada producto.
    try {
      const client = new Anthropic({ apiKey });
      const res = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system:
          "Eres un catalogador de insumos MRO industriales. Recibes líneas crudas de un catálogo/lista de un proveedor y devuelves un JSON array. Para cada producto completa y enriquece: nombre, numero_parte, marca, categoria (una de: rodamientos, epp, lubricantes, herramientas, neumatica, electrico, abrasivos, sujetadores, sellos, filtros), unidad, descripcion (1-2 frases técnicas), especificaciones (objeto clave/valor con specs típicas que infieras), certificaciones (array, ej. ISO 9001/IATF 16949 si aplica). Responde SOLO con el JSON array, sin texto extra.",
        messages: [{ role: "user", content: `Líneas:\n${raw.slice(0, 4000)}` }],
      });
      const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("");
      const json = text.slice(text.indexOf("["), text.lastIndexOf("]") + 1);
      const products = JSON.parse(json);
      return NextResponse.json({ products, enriched_by: "claude" });
    } catch {
      return NextResponse.json({ products: heuristicEnrich(raw), enriched_by: "heuristica" });
    }
  } catch {
    return NextResponse.json({ products: [], error: "Solicitud inválida" }, { status: 400 });
  }
}
