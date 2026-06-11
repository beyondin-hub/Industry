"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCardSector } from "@/components/sector/product-card-sector";
import { cn } from "@/lib/utils";
import type { IndustrySector, SectorCategory, SectorProduct } from "@/types";

// Grupos de filtros técnicos específicos por sector. Cada opción es un token
// que se busca en los badges y atributos técnicos del producto.
const FILTER_GROUPS: Record<string, { title: string; options: string[] }[]> = {
  medical: [
    { title: "Certificación", options: ["ISO 13485", "FDA", "USP", "ISO 11607"] },
    { title: "Clase de cuarto limpio", options: ["ISO Class 5", "ISO Class 7", "ISO Class 8"] },
    { title: "Características", options: ["Sin polvo", "Esterilizable", "Sin látex", "Sin pelusa"] },
  ],
  electronics: [
    { title: "Estándar ESD", options: ["ANSI S20.20", "IEC 61340"] },
    { title: "Clasificación", options: ["Conductive", "Dissipative"] },
    { title: "Compatibilidad", options: ["RoHS", "Lead-free", "IPC", "Sin halógenos"] },
  ],
};

type Avail = "todos" | "stock_tj";

function matchesToken(p: SectorProduct, token: string): boolean {
  const t = token.toLowerCase();
  return (
    p.badges.some((b) => b.toLowerCase().includes(t)) ||
    Object.values(p.atributos_tecnicos).some((v) => v.toLowerCase().includes(t)) ||
    p.nombre.toLowerCase().includes(t) ||
    p.uso_sector.toLowerCase().includes(t)
  );
}

export function SectorCatalog({
  sector,
  categories,
  products,
  initialCategory,
  initialQ,
}: {
  sector: IndustrySector;
  categories: SectorCategory[];
  products: SectorProduct[];
  initialCategory?: string;
  initialQ?: string;
}) {
  const color = sector.color_primario;
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [tokens, setTokens] = useState<string[]>([]);
  const [avail, setAvail] = useState<Avail>("todos");
  const [q, setQ] = useState(initialQ ?? "");

  const groups = FILTER_GROUPS[sector.slug] ?? [];

  const results = useMemo(() => {
    let list = products.slice();
    if (category) list = list.filter((p) => p.category_slug === category);
    if (avail === "stock_tj") list = list.filter((p) => p.en_stock_tj);
    if (tokens.length) list = list.filter((p) => tokens.every((t) => matchesToken(p, t)));
    if (q.trim()) {
      const query = q.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          (p.marca ?? "").toLowerCase().includes(query) ||
          matchesToken(p, query),
      );
    }
    return list.sort((a, b) => Number(b.destacado_sector) - Number(a.destacado_sector));
  }, [products, category, avail, tokens, q]);

  const toggleToken = (t: string) =>
    setTokens((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));

  const chips: { label: string; clear: () => void }[] = [];
  if (category) {
    const c = categories.find((x) => x.slug === category);
    chips.push({ label: c?.nombre ?? category, clear: () => setCategory(undefined) });
  }
  tokens.forEach((t) => chips.push({ label: t, clear: () => toggleToken(t) }));
  if (avail === "stock_tj") chips.push({ label: "En stock TJ", clear: () => setAvail("todos") });

  const clearAll = () => {
    setCategory(undefined);
    setTokens([]);
    setAvail("todos");
  };

  return (
    <div>
      {/* Categorías destacadas (scroll horizontal) */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <CatChip active={!category} color={color} onClick={() => setCategory(undefined)}>
          Todas
        </CatChip>
        {categories.map((c) => (
          <CatChip key={c.slug} active={category === c.slug} color={color} onClick={() => setCategory(c.slug)}>
            {c.icono} {c.nombre}
          </CatChip>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Filtros */}
        <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
          <div className="space-y-5 rounded-xl border bg-card p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-800">
              <SlidersHorizontal className="size-4" /> Filtros
            </p>

            <Facet title="Disponibilidad">
              <div className="space-y-1">
                {([["todos", "Cualquiera"], ["stock_tj", "En stock TJ"]] as const).map(([k, l]) => (
                  <FacetButton key={k} active={avail === k} onClick={() => setAvail(k as Avail)}>
                    {l}
                  </FacetButton>
                ))}
              </div>
            </Facet>

            {groups.map((g) => (
              <Facet key={g.title} title={g.title}>
                <div className="flex flex-wrap gap-1.5">
                  {g.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => toggleToken(o)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                        !tokens.includes(o) && "border-border text-ink-600 hover:border-ink-300",
                      )}
                      style={
                        tokens.includes(o)
                          ? { borderColor: color, color, backgroundColor: `${color}14` }
                          : undefined
                      }
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </Facet>
            ))}

            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
              CFDI garantizado en todos los productos
            </div>
          </div>
        </aside>

        {/* Resultados */}
        <div>
          <div className="mb-4 flex items-center gap-2 rounded-xl border bg-card p-2">
            <Search className="ml-2 size-5 shrink-0 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                sector.slug === "medical"
                  ? "Busca por nombre, SKU o certificación…"
                  : "Busca por nombre, SKU o estándar ESD…"
              }
              className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400"
            />
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-ink-600">
            <span className="font-semibold text-ink-900">{results.length}</span> productos
            {chips.map((c, i) => (
              <button
                key={i}
                onClick={c.clear}
                className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-0.5 text-xs text-ink-700 hover:border-danger hover:text-danger"
              >
                {c.label} <X className="size-3" />
              </button>
            ))}
            {chips.length > 0 && (
              <button onClick={clearAll} className="text-xs font-medium hover:underline" style={{ color }}>
                Limpiar todo
              </button>
            )}
          </div>

          {results.length > 0 ? (
            <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {results.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCardSector product={p} color={color} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="rounded-xl border bg-card py-16 text-center">
              <p className="text-ink-600">
                No encontramos {q ? `“${q}”` : "productos"} en {sector.nombre_brand}.
              </p>
              <p className="mt-1 text-sm text-ink-500">¿Quieres que Novak lo busque para ti?</p>
              <div className="mt-3 flex justify-center gap-2">
                <Button variant="outline" onClick={clearAll}>
                  Limpiar filtros
                </Button>
                <Link href={`/cotizar?q=${encodeURIComponent(q)}&sector=${sector.slug}`}>
                  <Button variant="gradient">Solicitar cotización especial</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CatChip({
  active,
  color,
  onClick,
  children,
}: {
  active?: boolean;
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        !active && "border-border bg-card text-ink-600 hover:border-ink-300",
      )}
      style={active ? { backgroundColor: color, borderColor: color, color: "#fff" } : undefined}
    >
      {children}
    </button>
  );
}

function Facet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t pt-4 first:border-t-0 first:pt-0">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</p>
      {children}
    </div>
  );
}
function FacetButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
        active ? "bg-ink-950 text-white" : "text-ink-600 hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}
