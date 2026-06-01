"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, Download, Loader2, CheckCircle2, FileArchive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mxn, fechaCorta } from "@/lib/utils";
import type { Order } from "@/types";

type Period = "30" | "90" | "custom";

const INCLUDES = [
  { key: "cfdi", label: "CFDI de todas las órdenes", default: true },
  { key: "coa", label: "COA (Certificate of Analysis) por lote", default: true },
  { key: "iso", label: "Certificaciones ISO de proveedores", default: true },
  { key: "ficha", label: "Fichas técnicas de productos", default: true },
  { key: "fda", label: "Declaraciones de conformidad FDA", default: true },
  { key: "temp", label: "Registros de temperatura de entrega (si aplica)", default: false },
];

export function AuditKit({ color, orders }: { color: string; orders: Order[] }) {
  const [period, setPeriod] = useState<Period>("90");
  const [includes, setIncludes] = useState<Record<string, boolean>>(
    Object.fromEntries(INCLUDES.map((i) => [i.key, i.default])),
  );
  const [state, setState] = useState<"idle" | "generating" | "done">("idle");

  const days = period === "30" ? 30 : period === "90" ? 90 : 365;
  const selected = useMemo(() => {
    const cutoff = Date.now() - days * 86_400_000;
    return orders.filter((o) => new Date(o.created_at).getTime() >= cutoff);
  }, [orders, days]);

  async function generate() {
    setState("generating");
    try {
      await fetch("/api/buyer/audit-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days,
          include: Object.entries(includes).filter(([, v]) => v).map(([k]) => k),
          order_ids: selected.map((o) => o.id),
        }),
      });
    } catch {
      /* demo: ignoramos errores de red */
    }
    setTimeout(() => setState("done"), 900);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="rounded-2xl border-l-[3px] p-5" style={{ borderLeftColor: color, backgroundColor: `${color}14` }}>
        <h1 className="flex items-center gap-2 text-xl font-bold" style={{ color }}>
          <ClipboardCheck className="size-5" /> Kit de Auditoría NOVAK Med
        </h1>
        <p className="mt-1 text-sm text-ink-600">Genera tu carpeta de documentación en segundos.</p>
      </header>

      {/* Paso 1 — período */}
      <section className="rounded-xl border bg-card p-5">
        <p className="text-sm font-semibold text-ink-900">1 · Selecciona el período</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["30", "90", "custom"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
              style={period === p ? { backgroundColor: color, borderColor: color, color: "#fff" } : undefined}
            >
              {p === "30" ? "Últimos 30 días" : p === "90" ? "Últimos 90 días" : "Rango personalizado"}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-600">
          <strong className="text-ink-900">{selected.length}</strong> órdenes encontradas
        </p>
      </section>

      {/* Paso 2 — incluir */}
      <section className="rounded-xl border bg-card p-5">
        <p className="text-sm font-semibold text-ink-900">2 · Selecciona qué incluir</p>
        <div className="mt-3 space-y-2">
          {INCLUDES.map((i) => (
            <label key={i.key} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={includes[i.key]}
                onChange={(e) => setIncludes((s) => ({ ...s, [i.key]: e.target.checked }))}
                className="size-4 accent-safety"
                style={{ accentColor: color }}
              />
              {i.label}
            </label>
          ))}
        </div>
      </section>

      {/* Paso 3 — generar */}
      <section className="rounded-xl border bg-card p-5">
        <p className="text-sm font-semibold text-ink-900">3 · Genera</p>
        {state !== "done" ? (
          <Button
            onClick={generate}
            disabled={state === "generating" || selected.length === 0}
            className="mt-3 w-full text-white"
            style={{ backgroundColor: color }}
          >
            {state === "generating" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generando kit…
              </>
            ) : (
              <>
                <Download className="size-4" /> Descargar Kit de Auditoría .ZIP
              </>
            )}
          </Button>
        ) : (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="size-4" /> Tu carpeta de auditoría está lista
            </p>
            <div className="mt-3 flex items-start gap-2 text-xs text-emerald-900/80">
              <FileArchive className="mt-0.5 size-4 shrink-0" />
              <span>
                Kit_Auditoria_NOVAK_Med_{new Date().toISOString().slice(0, 10)}.zip ·{" "}
                {selected.length} órdenes · {Object.values(includes).filter(Boolean).length} tipos de
                documento (CFDI, COA, certificaciones, fichas técnicas).
              </span>
            </div>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setState("idle")}>
              Generar otro
            </Button>
          </div>
        )}
        <p className="mt-3 text-center text-xs text-ink-400">Tu carpeta de auditoría lista en 1 clic</p>
      </section>

      {/* Vista de órdenes incluidas */}
      {selected.length > 0 && (
        <section className="rounded-xl border bg-card p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Órdenes incluidas
          </p>
          <div className="divide-y">
            {selected.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-medium text-ink-800">{o.folio}</span>
                <span className="text-ink-500">
                  {fechaCorta(o.created_at)} · {mxn(o.total)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
