"use client";

import { useState } from "react";
import { RefreshCw, ChevronDown, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { NIVEL_LABEL, CONSECUENCIA_LABEL, type ScoreNivel, type ScoreConsecuencia } from "@/lib/scoring/engine";
import type { ProviderScoreRow } from "@/lib/scoring/metrics";

const NIVEL_VARIANT: Record<ScoreNivel, any> = {
  elite: "success",
  bueno: "success",
  observacion: "warning",
  riesgo: "warning",
  critico: "danger",
};
const CONS_VARIANT: Record<ScoreConsecuencia, any> = {
  ninguna: "secondary",
  flag: "warning",
  reducir_visibilidad: "purplecow",
  suspender: "danger",
};

function Barra({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-danger";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Scorecard({ rows }: { rows: ProviderScoreRow[] }) {
  const { toast } = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function recalcular() {
    setRunning(true);
    try {
      const res = await fetch("/api/cron/calculate-scores");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        type: "success",
        title: "Scoring recalculado",
        description: `${data.evaluados} evaluados · ${data.suspendidos} suspendidos · ${data.visibilidad_reducida} con visibilidad reducida`,
      });
    } catch (e: any) {
      toast({ type: "error", title: "No se pudo recalcular", description: e?.message });
    } finally {
      setRunning(false);
    }
  }

  const ordenados = [...rows].sort((a, b) => a.breakdown.score - b.breakdown.score);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-sm font-semibold text-ink-700">Scorecard de proveedores</h2>
          <Button variant="outline" size="sm" onClick={recalcular} disabled={running}>
            {running ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            {running ? "Recalculando…" : "Recalcular ahora"}
          </Button>
        </div>
        <div className="divide-y">
          {ordenados.map((r) => {
            const b = r.breakdown;
            const expanded = open === r.provider_id;
            return (
              <div key={r.provider_id}>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : r.provider_id)}
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-secondary/30"
                >
                  <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-ink-950 text-white">
                    <span className="text-lg font-bold leading-none">{b.score.toFixed(1)}</span>
                    <span className="text-[9px] uppercase text-ink-400">/ 10</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-ink-900">{r.nombre}</span>
                      <Badge variant={NIVEL_VARIANT[b.nivel]}>{NIVEL_LABEL[b.nivel]}</Badge>
                    </div>
                    <p className="text-xs text-ink-500">{r.ciudad}</p>
                  </div>
                  <Badge variant={CONS_VARIANT[b.consecuencia]} className="shrink-0">
                    {CONSECUENCIA_LABEL[b.consecuencia]}
                  </Badge>
                  <ChevronDown className={`size-4 shrink-0 text-ink-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>

                {expanded && (
                  <div className="grid gap-5 bg-secondary/20 px-4 pb-5 pt-1 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-3 pt-3">
                      {b.componentes.map((c) => (
                        <div key={c.clave} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-ink-600">{c.label}</span>
                            <span className="font-medium text-ink-800">
                              {Math.round(c.rate * 100)}% · {c.puntos.toFixed(1)} pts (peso {Math.round(c.peso * 100)}%)
                            </span>
                          </div>
                          <Barra rate={c.rate} />
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border bg-paper-100 p-3">
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">Acciones</p>
                      <ul className="space-y-1 text-xs text-ink-700">
                        {b.acciones.filter(Boolean).map((a, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-safety">·</span> {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
