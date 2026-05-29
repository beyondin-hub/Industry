import type { Product } from "@/types";

// ────────────────────────────────────────────────────────────
// Búsqueda industrial: sinónimos + ranking por número de parte, marca,
// nombre, subcategoría y valores de especificaciones.
// ────────────────────────────────────────────────────────────

const SYNONYMS: Record<string, string[]> = {
  balero: ["rodamiento", "bearing", "balero"],
  rodamiento: ["balero", "bearing"],
  bearing: ["balero", "rodamiento"],
  chumacera: ["pillow", "soporte", "ucp"],
  guante: ["glove", "guantes"],
  lente: ["lentes", "goggle", "gafas", "proteccion ocular"],
  respirador: ["mascarilla", "cubrebocas", "n95"],
  grasa: ["lubricante", "grease"],
  aceite: ["lubricante", "oil"],
  sensor: ["proximidad", "inductivo"],
  valvula: ["válvula", "solenoide", "electrovalvula"],
  cilindro: ["actuador", "piston"],
  disco: ["corte", "abrasivo"],
  tornillo: ["perno", "bolt", "sujetador"],
  oring: ["o-ring", "sello", "empaque"],
  filtro: ["elemento filtrante"],
  banda: ["correa", "belt"],
  taladro: ["rotomartillo", "drill"],
  calibrador: ["vernier", "pie de rey"],
};

const STOP = new Set(["de", "la", "el", "los", "las", "para", "con", "un", "una", "mm", "pulg"]);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function tokenize(q: string): string[] {
  return normalize(q)
    .split(/[^a-z0-9./-]+/i)
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

function expand(tokens: string[]): string[] {
  const out = new Set(tokens);
  tokens.forEach((t) => (SYNONYMS[t] ?? []).forEach((syn) => out.add(normalize(syn))));
  return Array.from(out);
}

function scoreProduct(p: Product, tokens: string[]): number {
  const np = normalize(p.numero_parte || "");
  const marca = normalize(p.marca || "");
  const nombre = normalize(p.nombre || "");
  const sub = normalize(p.subcategoria || "");
  const cat = normalize(p.categoria || "");
  const specs = normalize(Object.values(p.especificaciones || {}).join(" "));
  const certs = normalize((p.certificaciones || []).join(" "));

  let score = 0;
  for (const t of tokens) {
    if (np === t) score += 50;            // match exacto de número de parte
    else if (np.includes(t)) score += 20;
    if (marca.includes(t)) score += 12;
    if (nombre.includes(t)) score += 10;
    if (sub.includes(t)) score += 6;
    if (cat.includes(t)) score += 4;
    if (specs.includes(t)) score += 5;    // busca por especificación (ej. "25mm", "24vdc")
    if (certs.includes(t)) score += 4;
  }
  // pequeño empuje a productos con stock
  if (score > 0 && p.stock_actual > 0) score += 1;
  return score;
}

/** Búsqueda con ranking. Query vacío → catálogo completo (orden original). */
export function rankedSearch(products: Product[], query: string): Product[] {
  const q = query?.trim();
  if (!q) return products;
  const tokens = expand(tokenize(q));
  if (tokens.length === 0) return products;
  return products
    .map((p) => ({ p, s: scoreProduct(p, tokens) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}
