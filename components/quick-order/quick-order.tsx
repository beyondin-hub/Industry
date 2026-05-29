"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Download, CheckCircle2, AlertCircle, Truck, FileSpreadsheet, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { PRODUCTS } from "@/lib/data/products";
import { mxn, num, entregaLabel, cn } from "@/lib/utils";
import type { Product } from "@/types";

interface Linea {
  query: string;
  cantidad: number;
  match?: Product;
}

function resolver(query: string): Product | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return (
    PRODUCTS.find((p) => p.numero_parte.toLowerCase() === q) ||
    PRODUCTS.find((p) => `${p.nombre} ${p.numero_parte} ${p.marca}`.toLowerCase().includes(q))
  );
}

export function QuickOrder() {
  const { toast } = useToast();
  const [raw, setRaw] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([]);

  // Formatos aceptados por línea: "6205-2RS x 50", "50 x 6205-2RS", "6205-2RS, 50", "6205-2RS"
  function procesar(text: string) {
    const out: Linea[] = [];
    for (const row of text.split(/\r?\n/)) {
      const line = row.trim();
      if (!line) continue;
      let query = line, cantidad = 1;
      const mx = line.match(/^(.*?)[\s,]*[x×][\s,]*(\d+)$/i) || line.match(/^(\d+)[\s,]*[x×][\s,]*(.*)$/i);
      const csv = line.split(",").map((s) => s.trim());
      if (mx) {
        if (/^\d+$/.test(mx[1])) { cantidad = Number(mx[1]); query = mx[2]; }
        else { query = mx[1]; cantidad = Number(mx[2]); }
      } else if (csv.length >= 2 && /^\d+$/.test(csv[1])) {
        query = csv[0]; cantidad = Number(csv[1]);
      }
      out.push({ query, cantidad: Math.max(1, cantidad), match: resolver(query) });
    }
    setLineas(out);
    const found = out.filter((l) => l.match).length;
    toast({
      type: found === out.length ? "success" : "info",
      title: `Encontramos ${found} de ${out.length} productos`,
      description: found < out.length ? "Los demás los buscamos y cotizamos en 2h." : "Todos en catálogo.",
    });
  }

  const found = lineas.filter((l) => l.match);
  const missing = lineas.filter((l) => !l.match);
  const subtotal = found.reduce((s, l) => s + (l.match!.precio_base * l.cantidad), 0);
  const template =
    "data:text/csv;charset=utf-8," + encodeURIComponent("Numero de Parte,Cantidad\n6205-2RS,50\nGR-EP2-400,24\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="mb-1 font-display font-semibold text-ink-900">Pega tus números de parte</p>
          <p className="mb-3 text-sm text-ink-500">Uno por línea. Acepta <span className="font-mono">6205-2RS x 50</span> o <span className="font-mono">6205-2RS, 50</span>.</p>
          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={6}
            className="font-mono"
            placeholder={"6205-2RS x 50\nGR-EP2-400 x 24\nSEN-IND-M18 x 10"}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="gradient" onClick={() => procesar(raw)}>Resolver productos</Button>
            <label className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}>
              <Upload className="size-4" /> Subir CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) f.text().then((t) => { setRaw(t); procesar(t); });
                }}
              />
            </label>
            <a href={template} download="plantilla-quick-order.csv" className="inline-flex items-center gap-1 text-xs font-medium text-safety hover:underline">
              <Download className="size-3.5" /> Plantilla
            </a>
            {lineas.length > 0 && (
              <button onClick={() => { setLineas([]); setRaw(""); }} className="ml-auto inline-flex items-center gap-1 text-xs text-ink-500 hover:text-danger">
                <Trash2 className="size-3.5" /> Limpiar
              </button>
            )}
          </div>
        </div>

        {lineas.length > 0 && (
          <div className="space-y-2">
            {found.map((l, i) => (
              <div key={`f${i}`} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{l.match!.nombre}</p>
                  <p className="flex items-center gap-2 text-xs text-ink-500">
                    <span className="font-mono">{l.match!.numero_parte}</span>
                    <Badge variant="success" className="text-[10px]"><Truck className="size-2.5" /> {entregaLabel(l.match!.tiempo_entrega_horas)}</Badge>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink-900">{mxn(l.match!.precio_base * l.cantidad)}</p>
                  <p className="text-xs text-ink-500">{num(l.cantidad)} {l.match!.unidad}</p>
                </div>
              </div>
            ))}
            {missing.map((l, i) => (
              <div key={`m${i}`} className="flex items-center gap-3 rounded-lg border border-dashed bg-card p-3">
                <AlertCircle className="size-5 shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{l.query}</p>
                  <p className="text-xs text-amber-600">No está en catálogo — nuestro equipo lo busca y cotiza en 2h.</p>
                </div>
                <span className="text-xs text-ink-500">{num(l.cantidad)} pza</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border bg-card p-5">
          <p className="font-display font-semibold text-ink-900">Resumen</p>
          <div className="mt-3 space-y-1.5 text-sm">
            <Row k="En catálogo" v={`${found.length}`} />
            <Row k="Por buscar" v={`${missing.length}`} />
            <Row k="Subtotal estimado" v={mxn(subtotal)} bold />
          </div>
          <Link
            href="/cotizar"
            className={cn(buttonVariants({ variant: "gradient" }), "mt-4 w-full", lineas.length === 0 && "pointer-events-none opacity-50")}
          >
            <FileSpreadsheet className="size-4" /> Crear RFQ con esta lista
          </Link>
          <p className="mt-2 text-center text-xs text-ink-500">Cotización garantizada en 2 horas hábiles</p>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{k}</span>
      <span className={cn(bold ? "text-base font-bold text-ink-950" : "font-medium text-ink-800")}>{v}</span>
    </div>
  );
}
