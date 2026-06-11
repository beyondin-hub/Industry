"use client";

import { useState } from "react";
import { Printer, Upload, CheckCircle2, MapPin, Clock, Truck, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { tiempoRestante, fechaCorta } from "@/lib/utils";
import type { DispatchInstruction, DispatchEstado } from "@/lib/data/dispatches";

const ESTADO_BADGE: Record<DispatchEstado, { label: string; variant: any }> = {
  pendiente: { label: "Por despachar", variant: "warning" },
  impreso: { label: "Etiqueta impresa", variant: "purplecow" },
  despachado: { label: "Despachado", variant: "success" },
  vencido: { label: "Vencido", variant: "danger" },
};

export function DispatchList({ dispatches }: { dispatches: DispatchInstruction[] }) {
  const [items, setItems] = useState(dispatches);
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  function update(id: string, patch: Partial<DispatchInstruction>) {
    setItems((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function imprimir(d: DispatchInstruction) {
    if (d.etiqueta_url) window.open(d.etiqueta_url, "_blank");
    if (d.estado === "pendiente") update(d.id, { estado: "impreso" });
    toast({ type: "success", title: "Etiqueta lista", description: `${d.carrier} · ${d.folio}` });
  }

  function subirEvidencia(d: DispatchInstruction, file?: File) {
    const url = file ? URL.createObjectURL(file) : "https://rastreo.novak.mx/evidencia/demo.jpg";
    update(d.id, { evidencia_url: url });
    toast({ type: "success", title: "Evidencia adjuntada" });
  }

  async function confirmar(d: DispatchInstruction) {
    if (!d.evidencia_url) {
      toast({ type: "error", title: "Sube la foto de evidencia antes de confirmar" });
      return;
    }
    setBusy(d.id);
    try {
      const res = await fetch("/api/shipping/dispatch-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dispatchId: d.id, folio: d.folio, evidenciaUrl: d.evidencia_url, guia: d.guia }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      update(d.id, { estado: "despachado", confirmado_at: data.confirmado_at, sla_horas: data.sla_horas ?? undefined });
      toast({
        type: "success",
        title: "Despacho confirmado",
        description: data.sla_horas != null ? `SLA de despacho: ${data.sla_horas}h` : undefined,
      });
    } catch (e: any) {
      toast({ type: "error", title: "No se pudo confirmar", description: e?.message });
    } finally {
      setBusy(null);
    }
  }

  if (!items.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-ink-500">
          <Truck className="size-8 text-ink-300" />
          <p className="text-sm">No tienes despachos pendientes. Te avisaremos cuando recibas una orden por surtir.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((d) => {
        const restante = tiempoRestante(d.deadline);
        const vencido = restante.vencido && d.estado !== "despachado";
        const estado = vencido ? "vencido" : d.estado;
        const badge = ESTADO_BADGE[estado];
        const done = d.estado === "despachado";
        return (
          <Card key={d.id} className={done ? "opacity-80" : ""}>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-ink-900">{d.folio}</span>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
                    <MapPin className="size-3.5" /> {d.empresa} · {d.destino} · {d.carrier}
                  </p>
                </div>
                <div className="text-right">
                  {done ? (
                    <p className="text-xs font-medium text-emerald-600">
                      Despachado{d.sla_horas != null ? ` · SLA ${d.sla_horas}h` : ""}
                    </p>
                  ) : (
                    <p className={`flex items-center gap-1 text-xs font-semibold ${vencido ? "text-danger" : "text-amber-600"}`}>
                      <Clock className="size-3.5" /> {vencido ? "Deadline vencido" : `Despachar en ${restante.label}`}
                    </p>
                  )}
                  {d.guia && <p className="mt-0.5 font-mono text-[11px] text-ink-400">{d.guia}</p>}
                </div>
              </div>

              {!done && (
                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button variant="outline" size="sm" onClick={() => imprimir(d)}>
                    <Printer className="size-4" /> Imprimir etiqueta
                  </Button>

                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => subirEvidencia(d, e.target.files?.[0])}
                    />
                    <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-sm font-medium hover:bg-secondary/50">
                      {d.evidencia_url ? <ImageIcon className="size-4 text-emerald-600" /> : <Upload className="size-4" />}
                      {d.evidencia_url ? "Evidencia lista" : "Subir evidencia"}
                    </span>
                  </label>

                  <Button
                    variant="accent"
                    size="sm"
                    className="ml-auto"
                    disabled={busy === d.id}
                    onClick={() => confirmar(d)}
                  >
                    <CheckCircle2 className="size-4" /> {busy === d.id ? "Confirmando…" : "Confirmar despacho"}
                  </Button>
                </div>
              )}

              {done && d.confirmado_at && (
                <p className="border-t pt-3 text-xs text-ink-400">
                  Confirmado el {fechaCorta(d.confirmado_at)} · evidencia adjunta
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
