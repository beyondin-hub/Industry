"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, CheckCircle2, AlertTriangle, XCircle, Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatalogStore } from "@/lib/catalog/store";
import { mxn } from "@/lib/utils";

interface Row {
  descripcion?: string;
  numero_parte?: string;
  cantidad?: number;
  unidad?: string;
}
interface Slim {
  id: string;
  nombre: string;
  numero_parte: string;
  marca: string;
  precio_base: number;
  unidad: string;
  stock_actual: number;
}
interface Result {
  encontrados: { row: Row; product: Slim }[];
  similares: { row: Row; product: Slim }[];
  no_encontrados: Row[];
}

// Parser CSV mínimo: columnas numero_parte, cantidad[, descripcion, unidad].
// Acepta también "descripcion, numero_parte, cantidad, unidad".
function parseCSV(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const rows: Row[] = [];
  for (const line of lines) {
    const cells = line.split(/[,;\t]/).map((c) => c.trim());
    if (cells.length === 0) continue;
    // Saltar encabezado.
    if (/parte|descrip|cantidad|sku/i.test(line) && !/\d/.test(cells.join(""))) continue;
    // Heurística: la celda con guion+dígitos es número de parte; el número es cantidad.
    const numero_parte = cells.find((c) => /[a-z]*\d/i.test(c) && /[-]/.test(c)) ?? cells.find((c) => /\d{3,}/.test(c)) ?? cells[0];
    const cantidad = Number(cells.find((c) => /^\d+$/.test(c)) ?? 1) || 1;
    const descripcion = cells.find((c) => c !== numero_parte && !/^\d+$/.test(c)) ?? "";
    rows.push({ numero_parte, cantidad, descripcion });
  }
  return rows;
}

export default function ImportarPage() {
  const { addToCart } = useCatalogStore();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [added, setAdded] = useState(false);

  async function procesar(rows: Row[]) {
    if (rows.length === 0) return;
    setLoading(true);
    setAdded(false);
    try {
      const r = await fetch("/api/catalogo/import-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      setResult(await r.json());
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const t = String(reader.result ?? "");
      setText(t);
      procesar(parseCSV(t));
    };
    reader.readAsText(file);
  }

  function agregarTodo() {
    if (!result) return;
    [...result.encontrados, ...result.similares].forEach(({ row, product }) =>
      addToCart(product.id, Math.max(1, row.cantidad ?? 1)),
    );
    setAdded(true);
  }

  const matchCount = result ? result.encontrados.length + result.similares.length : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-ink-900">
          <Upload className="size-5 text-safety" /> Importar lista de compra
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Pega tu lista o sube un CSV. Columnas: número de parte, cantidad (y opcional descripción/unidad).
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={"6205-2RS, 100\nNIT-9-GR, 500, Guante nitrilo\nGR-EP2-400, 24"}
          className="w-full rounded-lg border border-input bg-card p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="accent" onClick={() => procesar(parseCSV(text))} disabled={loading || !text.trim()}>
            {loading ? <><Loader2 className="size-4 animate-spin" /> Procesando…</> : "Procesar lista"}
          </Button>
          <label className="cursor-pointer">
            <input type="file" accept=".csv,text/csv,text/plain" onChange={onFile} className="hidden" />
            <span className="inline-flex h-10 items-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-semibold hover:bg-secondary">
              <Upload className="size-4" /> Subir CSV
            </span>
          </label>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
            <p className="text-sm text-ink-700">
              <strong>{result.encontrados.length}</strong> encontrados ·{" "}
              <strong>{result.similares.length}</strong> similares ·{" "}
              <strong>{result.no_encontrados.length}</strong> no encontrados
            </p>
            {matchCount > 0 && (
              <Button variant="accent" onClick={agregarTodo} disabled={added}>
                {added ? <><CheckCircle2 className="size-4" /> Agregados</> : <><ClipboardList className="size-4" /> Agregar {matchCount} a cotización</>}
              </Button>
            )}
          </div>

          {added && (
            <Link href="/cotizacion" className="block text-center text-sm font-medium text-safety hover:underline">
              Ver mi cotización →
            </Link>
          )}

          <ResultGroup tone="ok" title="Encontrados" items={result.encontrados} />
          <ResultGroup tone="warn" title="Similares (¿es este?)" items={result.similares} />

          {result.no_encontrados.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                <XCircle className="size-4 text-danger" /> No encontrados
              </p>
              <ul className="space-y-1 text-sm text-ink-600">
                {result.no_encontrados.map((r, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{r.numero_parte} {r.descripcion ? `· ${r.descripcion}` : ""}</span>
                    <Link href={`/cotizar?q=${encodeURIComponent(r.numero_parte ?? "")}`} className="text-xs font-medium text-safety hover:underline">
                      Cotización especial →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  tone,
  title,
  items,
}: {
  tone: "ok" | "warn";
  title: string;
  items: { row: Row; product: Slim }[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
        {tone === "ok" ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertTriangle className="size-4 text-amber-600" />}
        {title}
      </p>
      <div className="divide-y">
        {items.map(({ row, product }, i) => (
          <div key={i} className="flex items-center justify-between gap-2 py-2 text-sm">
            <Link href={`/catalogo/${product.id}`} className="min-w-0">
              <span className="block truncate font-medium text-ink-900 hover:underline">{product.nombre}</span>
              <span className="text-xs text-steel-500">{product.numero_parte} · {product.marca}</span>
            </Link>
            <span className="shrink-0 text-right text-xs text-ink-600">
              <span className="block font-semibold">{mxn(product.precio_base)}</span>
              ×{row.cantidad ?? 1} {product.unidad}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
