"use client";

import { useState } from "react";
import { Search, Truck, Zap, CheckCircle2, Loader2, FileText, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { mxn } from "@/lib/utils";
import type { CarrierRate, CarrierPolicy } from "@/lib/shipping";

const POLICIES: { id: CarrierPolicy; label: string }[] = [
  { id: "balanceado", label: "Balanceado" },
  { id: "barato", label: "Más barato" },
  { id: "rapido", label: "Más rápido" },
];

export function ManualShipmentBuilder() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    origen: "Tijuana",
    destino: "Monterrey",
    peso_kg: "5",
    folio: "",
    urgente: false,
    policy: "balanceado" as CarrierPolicy,
  });
  const [rates, setRates] = useState<CarrierRate[]>([]);
  const [demo, setDemo] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState<any>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function cotizar() {
    setLoading(true);
    setRates([]);
    setSel(null);
    setLabel(null);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origen: { ciudad: form.origen },
          destino: { ciudad: form.destino },
          peso_kg: Number(form.peso_kg) || 5,
          urgente: form.urgente,
          policy: form.policy,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRates(data.rates);
      setDemo(data.demo);
      const rec = data.rates.find((r: CarrierRate) => r.recomendado);
      setSel(rec?.id ?? data.rates[0]?.id ?? null);
    } catch (e: any) {
      toast({ type: "error", title: "No se pudo cotizar", description: e?.message });
    } finally {
      setLoading(false);
    }
  }

  async function generar() {
    const rate = rates.find((r) => r.id === sel);
    if (!rate) return;
    setCreating(true);
    try {
      const res = await fetch("/api/shipping/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folio: form.folio || undefined,
          rateId: rate.id,
          carrier: rate.carrier,
          servicio_code: rate.servicio_code,
          origen: { ciudad: form.origen },
          destino: { ciudad: form.destino },
          peso_kg: Number(form.peso_kg) || 5,
          conCartaPorte: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLabel(data.label);
      toast({ type: "success", title: "Guía generada", description: `${data.label.carrier} · ${data.label.guia}` });
    } catch (e: any) {
      toast({ type: "error", title: "No se pudo generar la guía", description: e?.message });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* Formulario */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Datos del envío</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="origen">Origen</Label>
              <Input id="origen" value={form.origen} onChange={(e) => set("origen", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="destino">Destino</Label>
              <Input id="destino" value={form.destino} onChange={(e) => set("destino", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input id="peso" type="number" min="1" value={form.peso_kg} onChange={(e) => set("peso_kg", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="folio">Folio orden (opcional)</Label>
              <Input id="folio" value={form.folio} onChange={(e) => set("folio", e.target.value)} placeholder="ORD-123" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Política de selección</Label>
            <div className="flex gap-1.5">
              {POLICIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set("policy", p.id)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    form.policy === p.id ? "border-safety bg-safety/10 text-safety" : "border-input text-ink-500 hover:bg-secondary/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={form.urgente} onChange={(e) => set("urgente", e.target.checked)} className="size-4 rounded accent-safety" />
            <Zap className="size-4 text-amber-500" /> Urgente (prioriza velocidad)
          </label>
          <Button onClick={cotizar} disabled={loading} className="w-full" variant="accent">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {loading ? "Cotizando…" : "Cotizar tarifas"}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados */}
      <div className="space-y-4">
        {rates.length === 0 && !loading && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-ink-400">
              <Truck className="size-8 text-ink-300" />
              <p className="text-sm">Cotiza para comparar tarifas de Estafeta, FedEx y Paquetexpress en vivo.</p>
            </CardContent>
          </Card>
        )}

        {rates.length > 0 && (
          <>
            {demo && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Modo demo: tarifas estimadas. Conecta <span className="font-mono">ENVIAYA_API_KEY</span> para tarifas reales en vivo.
              </p>
            )}
            <div className="space-y-2">
              {rates.map((r) => {
                const active = sel === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSel(r.id)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                      active ? "border-safety bg-safety/5 ring-1 ring-safety" : "border-input hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 items-center justify-center rounded-lg ${active ? "bg-safety text-white" : "bg-secondary text-ink-500"}`}>
                        <Truck className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink-900">{r.carrier}</span>
                          {r.recomendado && (
                            <Badge variant="success" className="gap-1">
                              <Star className="size-3" /> Óptima
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-ink-500">
                          {r.servicio} · {r.dias_estimados} día{r.dias_estimados !== 1 ? "s" : ""} ({Math.round(r.eta_horas)}h)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-ink-950">{mxn(r.costo)}</p>
                      {active && <CheckCircle2 className="ml-auto size-4 text-safety" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {!label ? (
              <Button onClick={generar} disabled={creating || !sel} className="w-full" variant="accent">
                {creating ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
                {creating ? "Generando guía…" : "Generar guía + Carta Porte"}
              </Button>
            ) : (
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center gap-2 font-semibold text-emerald-700">
                    <CheckCircle2 className="size-5" /> Guía generada
                  </div>
                  <div className="grid gap-1 text-sm text-ink-700">
                    <p>Carrier: <span className="font-medium">{label.carrier}</span></p>
                    <p>Guía: <span className="font-mono">{label.guia}</span></p>
                    {label.carta_porte_uuid && <p>Carta Porte: <span className="font-mono text-xs">{label.carta_porte_uuid}</span></p>}
                  </div>
                  {label.etiqueta_url && (
                    <a href={label.etiqueta_url} target="_blank" rel="noreferrer" className="inline-block">
                      <Button variant="outline" size="sm"><FileText className="size-4" /> Descargar etiqueta</Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
