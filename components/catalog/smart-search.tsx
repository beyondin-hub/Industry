"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Clock, CheckCircle2, Package, Tag, ArrowRight, X } from "lucide-react";
import { mxn } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Slim {
  id: string;
  nombre: string;
  numero_parte: string;
  marca: string;
  categoria: string;
  precio_base: number;
  stock_actual: number;
}
interface Cat {
  slug: string;
  nombre: string;
  emoji: string;
  total: number;
}
interface Suggest {
  exact: Slim | null;
  products: Slim[];
  categories: Cat[];
  total: number;
}

const RECENT_KEY = "novak_recent_searches";

function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5);
  } catch {
    return [];
  }
}
function pushRecent(q: string) {
  if (!q.trim()) return;
  const cur = getRecent().filter((x) => x.toLowerCase() !== q.toLowerCase());
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...cur].slice(0, 5)));
}

export function SmartSearch({
  placeholder = "Busca por número de parte, descripción o marca…",
  autoFocus = false,
}: {
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Suggest | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setRecent(getRecent()), [open]);

  // Debounce de sugerencias.
  useEffect(() => {
    if (q.trim().length < 2) {
      setData(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/catalogo/search?suggest=1&q=${encodeURIComponent(q)}`);
        setData(await r.json());
      } catch {
        setData(null);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // Cerrar al click afuera.
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const goSearch = (term: string) => {
    if (!term.trim()) return;
    pushRecent(term);
    setOpen(false);
    router.push(`/catalogo/busqueda?q=${encodeURIComponent(term)}`);
  };

  const goProduct = (id: string) => {
    pushRecent(q);
    setOpen(false);
    router.push(`/catalogo/${id}`);
  };

  const showRecent = q.trim().length < 2 && recent.length > 0;

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goSearch(q);
        }}
        className="flex items-center"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-400" />
          <input
            value={q}
            autoFocus={autoFocus}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="h-10 w-full rounded-md border border-input bg-steel-50 pl-9 pr-9 text-base outline-none focus:bg-card focus:ring-2 focus:ring-ring sm:text-sm"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-steel-400 hover:text-steel-700"
              aria-label="Limpiar"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </form>

      {open && (showRecent || data) && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border bg-card shadow-xl">
          {showRecent && (
            <Section icon={Clock} title="Tus búsquedas recientes">
              <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    onClick={() => goSearch(r)}
                    className="rounded-full border px-2.5 py-1 text-xs text-steel-700 hover:border-safety hover:text-safety"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {data?.exact && (
            <Section icon={CheckCircle2} title="Producto exacto">
              <button
                onClick={() => goProduct(data.exact!.id)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-steel-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-steel-900">{data.exact.nombre}</span>
                  <span className="font-mono text-xs text-steel-500">{data.exact.numero_parte}</span>
                </span>
                <span className="shrink-0 text-right text-xs">
                  <span className="block font-semibold text-steel-900">{mxn(data.exact.precio_base)}</span>
                  <span className={data.exact.stock_actual > 0 ? "text-emerald-600" : "text-amber-600"}>
                    {data.exact.stock_actual > 0 ? `🟢 ${data.exact.stock_actual} en TJ` : "Bajo pedido"}
                  </span>
                </span>
              </button>
            </Section>
          )}

          {data && data.products.length > 0 && (
            <Section icon={Package} title="Productos sugeridos">
              {data.products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => goProduct(p.id)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-steel-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-steel-800">{p.nombre}</span>
                    <span className="text-xs text-steel-500">{p.marca} · {p.numero_parte}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-steel-700">{mxn(p.precio_base)}</span>
                </button>
              ))}
            </Section>
          )}

          {data && data.categories.length > 0 && (
            <Section icon={Tag} title="Categorías relacionadas">
              {data.categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/catalogo/busqueda?categoria=${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-sm hover:bg-steel-50"
                >
                  <span>{c.emoji} {c.nombre}</span>
                  <span className="text-xs text-steel-400">{c.total} productos</span>
                </Link>
              ))}
            </Section>
          )}

          {data && (
            <button
              onClick={() => goSearch(q)}
              className="flex w-full items-center justify-center gap-1.5 border-t bg-steel-50/60 px-3 py-2.5 text-sm font-semibold text-safety hover:bg-steel-50"
            >
              Ver todos los resultados {data.total ? `(${data.total})` : ""} <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b last:border-b-0">
      <p className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-steel-400">
        <Icon className="size-3" /> {title}
      </p>
      {children}
    </div>
  );
}
