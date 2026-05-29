"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { CATEGORIAS, categoriaNombre } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CategoriaMRO, Product } from "@/types";

type Sort = "relevancia" | "precio_asc" | "precio_desc" | "entrega" | "stock";
type Entrega = "todos" | "24" | "48" | "mas";

export function CatalogBrowser({
  products,
  initialCategoria,
  q,
}: {
  products: Product[];
  initialCategoria?: CategoriaMRO;
  q?: string;
}) {
  const [categoria, setCategoria] = useState<CategoriaMRO | undefined>(initialCategoria);
  const [certs, setCerts] = useState<string[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [entrega, setEntrega] = useState<Entrega>("todos");
  const [soloStock, setSoloStock] = useState(false);
  const [precioMax, setPrecioMax] = useState<number>(0);
  const [sort, setSort] = useState<Sort>("relevancia");

  // Facetas disponibles derivadas del set.
  const allCerts = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.certificaciones))).sort(),
    [products],
  );
  const allMarcas = useMemo(
    () => Array.from(new Set(products.map((p) => p.marca).filter(Boolean))).sort(),
    [products],
  );
  const maxPrecio = useMemo(
    () => Math.max(...products.map((p) => p.precio_base), 0),
    [products],
  );

  const results = useMemo(() => {
    let list = products.slice();
    if (categoria) list = list.filter((p) => p.categoria === categoria);
    if (certs.length) list = list.filter((p) => certs.every((c) => p.certificaciones.includes(c)));
    if (marcas.length) list = list.filter((p) => marcas.includes(p.marca));
    if (soloStock) list = list.filter((p) => p.stock_actual > 0);
    if (entrega === "24") list = list.filter((p) => p.tiempo_entrega_horas <= 24);
    else if (entrega === "48") list = list.filter((p) => p.tiempo_entrega_horas <= 48);
    else if (entrega === "mas") list = list.filter((p) => p.tiempo_entrega_horas > 48);
    if (precioMax > 0) list = list.filter((p) => p.precio_base <= precioMax);

    switch (sort) {
      case "precio_asc": list.sort((a, b) => a.precio_base - b.precio_base); break;
      case "precio_desc": list.sort((a, b) => b.precio_base - a.precio_base); break;
      case "entrega": list.sort((a, b) => a.tiempo_entrega_horas - b.tiempo_entrega_horas); break;
      case "stock": list.sort((a, b) => b.stock_actual - a.stock_actual); break;
    }
    return list;
  }, [products, categoria, certs, marcas, soloStock, entrega, precioMax, sort]);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const chips: { label: string; clear: () => void }[] = [];
  if (categoria) chips.push({ label: categoriaNombre(categoria), clear: () => setCategoria(undefined) });
  certs.forEach((c) => chips.push({ label: c, clear: () => setCerts((a) => a.filter((x) => x !== c)) }));
  marcas.forEach((m) => chips.push({ label: m, clear: () => setMarcas((a) => a.filter((x) => x !== m)) }));
  if (entrega !== "todos") chips.push({ label: entrega === "24" ? "Entrega 24h" : entrega === "48" ? "Entrega 48h" : "3-5 días", clear: () => setEntrega("todos") });
  if (soloStock) chips.push({ label: "En stock", clear: () => setSoloStock(false) });
  if (precioMax > 0) chips.push({ label: `≤ $${precioMax}`, clear: () => setPrecioMax(0) });

  const clearAll = () => {
    setCategoria(undefined); setCerts([]); setMarcas([]); setEntrega("todos"); setSoloStock(false); setPrecioMax(0);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* Sidebar de filtros (sticky) */}
      <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
        <div className="space-y-5 rounded-xl border bg-card p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-800">
            <SlidersHorizontal className="size-4" /> Filtros
          </p>

          <Facet title="Categoría">
            <div className="space-y-1">
              <FacetButton active={!categoria} onClick={() => setCategoria(undefined)}>Todas</FacetButton>
              {CATEGORIAS.map((c) => (
                <FacetButton key={c.slug} active={categoria === c.slug} onClick={() => setCategoria(c.slug)}>
                  <span>{c.emoji}</span> {c.nombre}
                </FacetButton>
              ))}
            </div>
          </Facet>

          <Facet title="Certificación">
            <div className="flex flex-wrap gap-1.5">
              {allCerts.map((c) => (
                <Chip key={c} active={certs.includes(c)} onClick={() => toggle(certs, c, setCerts)}>
                  <ShieldCheck className="size-3" /> {c}
                </Chip>
              ))}
            </div>
          </Facet>

          <Facet title="Tiempo de entrega">
            <div className="space-y-1">
              {([["todos", "Cualquiera"], ["24", "En stock 24h"], ["48", "48 horas"], ["mas", "3-5 días"]] as const).map(([k, l]) => (
                <FacetButton key={k} active={entrega === k} onClick={() => setEntrega(k as Entrega)}>{l}</FacetButton>
              ))}
            </div>
          </Facet>

          <Facet title={`Precio máximo${precioMax ? `: $${precioMax}` : ""}`}>
            <input
              type="range"
              min={0}
              max={Math.ceil(maxPrecio)}
              step={50}
              value={precioMax || maxPrecio}
              onChange={(e) => setPrecioMax(Number(e.target.value))}
              className="w-full accent-safety"
            />
            <div className="flex justify-between text-[11px] text-ink-400">
              <span>$0</span><span>${Math.ceil(maxPrecio)}</span>
            </div>
          </Facet>

          <Facet title="Marca">
            <div className="max-h-40 space-y-0.5 overflow-y-auto">
              {allMarcas.map((m) => (
                <label key={m} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-ink-600 hover:bg-secondary">
                  <input type="checkbox" checked={marcas.includes(m)} onChange={() => toggle(marcas, m, setMarcas)} className="size-3.5 accent-safety" />
                  {m}
                </label>
              ))}
            </div>
          </Facet>

          <label className="flex cursor-pointer items-center justify-between text-sm text-ink-700">
            Solo con stock confirmado
            <input type="checkbox" checked={soloStock} onChange={(e) => setSoloStock(e.target.checked)} className="size-4 accent-safety" />
          </label>

          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
            <ShieldCheck className="mr-1 inline size-3" /> CFDI garantizado en todos los productos
          </div>
        </div>
      </aside>

      {/* Resultados */}
      <div>
        {/* Quick Order bar sticky */}
        <form action="/catalogo" className="sticky top-16 z-10 mb-4 flex items-center gap-2 rounded-xl border bg-card/95 p-2 shadow-sm backdrop-blur">
          <Search className="ml-2 size-5 shrink-0 text-ink-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Tengo el número de parte: pega tu SKU…"
            className="h-10 flex-1 bg-transparent font-mono text-sm outline-none placeholder:font-sans placeholder:text-ink-400"
          />
          <Button type="submit" variant="gradient">Buscar</Button>
        </form>

        {/* Header: conteo + chips + sort */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-600">
            <span className="font-semibold text-ink-900">{results.length}</span> productos
            {q && <Badge variant="accent">“{q}”</Badge>}
            {chips.map((c, i) => (
              <button key={i} onClick={c.clear} className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-0.5 text-xs text-ink-700 hover:border-danger hover:text-danger">
                {c.label} <X className="size-3" />
              </button>
            ))}
            {chips.length > 0 && (
              <button onClick={clearAll} className="text-xs font-medium text-safety hover:underline">Limpiar todo</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-500">Ordenar:</span>
            <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9 w-44">
              <option value="relevancia">Relevancia</option>
              <option value="precio_asc">Precio: menor</option>
              <option value="precio_desc">Precio: mayor</option>
              <option value="entrega">Entrega más rápida</option>
              <option value="stock">Mayor stock</option>
            </Select>
          </div>
        </div>

        {/* Grid animado */}
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
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="rounded-xl border bg-card py-16 text-center">
            <p className="text-ink-600">No hay productos con esos filtros.</p>
            <div className="mt-3 flex justify-center gap-2">
              <Button variant="outline" onClick={clearAll}>Limpiar filtros</Button>
              <Link href="/cotizar"><Button variant="gradient">Cotizar con foto del componente</Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
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
function FacetButton({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
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
function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active ? "border-safety bg-safety-50 text-safety" : "border-border text-ink-600 hover:border-ink-300",
      )}
    >
      {children}
    </button>
  );
}
