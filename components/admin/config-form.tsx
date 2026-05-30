"use client";

import { useState } from "react";
import { Save, Loader2, Percent, CreditCard, Truck, ToggleRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { categoriaNombre } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { savePlatformConfig } from "@/app/(admin)/admin/config/actions";
import type { PlatformConfig } from "@/lib/data/admin";
import type { CategoriaMRO } from "@/types";

const FLAG_LABEL: Record<string, string> = {
  rfq_publico: "RFQ público (sin login para cotizar)",
  credito_auto: "Aprobación de crédito automática (por score)",
  busqueda_imagen: "Búsqueda por imagen en catálogo",
  reorden_auto: "Reorden automático para compradores",
};

export function ConfigForm({ initial }: { initial: PlatformConfig }) {
  const { toast } = useToast();
  const [cfg, setCfg] = useState<PlatformConfig>(initial);
  const [saving, setSaving] = useState(false);

  function setComision(i: number, pct: number) {
    setCfg((c) => ({ ...c, comisiones: c.comisiones.map((x, idx) => (idx === i ? { ...x, pct } : x)) }));
  }
  async function guardar() {
    setSaving(true);
    const res = await savePlatformConfig(cfg);
    setSaving(false);
    toast({ type: res.ok ? "success" : "error", title: res.ok ? "Configuración guardada" : "No se pudo guardar", description: res.error });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="gradient" onClick={guardar} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4" /> Guardar cambios</>}</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Comisiones por categoría */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Percent className="size-5 text-safety" /> Comisión por categoría</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {cfg.comisiones.map((c, i) => (
              <div key={c.categoria} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
                <span className="truncate text-sm text-ink-700">{categoriaNombre(c.categoria as CategoriaMRO)}</span>
                <div className="flex items-center gap-1">
                  <Input type="number" min={0} max={30} value={c.pct} onChange={(e) => setComision(i, Number(e.target.value))} className="h-8 w-16 text-right" />
                  <span className="text-sm text-ink-500">%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Crédito */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="size-5 text-info" /> Parámetros de crédito</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <div><Label className="mb-1 block text-[11px]">Score mínimo</Label><Input type="number" min={0} max={100} value={cfg.credito.score_minimo} onChange={(e) => setCfg((c) => ({ ...c, credito: { ...c.credito, score_minimo: Number(e.target.value) } }))} /></div>
              <div><Label className="mb-1 block text-[11px]">Plazo máx (días)</Label><Input type="number" min={0} value={cfg.credito.plazo_max} onChange={(e) => setCfg((c) => ({ ...c, credito: { ...c.credito, plazo_max: Number(e.target.value) } }))} /></div>
              <div><Label className="mb-1 block text-[11px]">Exposición máx %</Label><Input type="number" min={0} max={100} value={cfg.credito.exposicion_max_pct} onChange={(e) => setCfg((c) => ({ ...c, credito: { ...c.credito, exposicion_max_pct: Number(e.target.value) } }))} /></div>
            </CardContent>
          </Card>

          {/* Fees */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="size-5 text-purplecow" /> Fees de servicios</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <div><Label className="mb-1 block text-[11px]">Financiamiento %</Label><Input type="number" min={0} value={cfg.fees.financiamiento_pct} onChange={(e) => setCfg((c) => ({ ...c, fees: { ...c.fees, financiamiento_pct: Number(e.target.value) } }))} /></div>
              <div><Label className="mb-1 block text-[11px]">Fulfillment %</Label><Input type="number" min={0} value={cfg.fees.fulfillment_pct} onChange={(e) => setCfg((c) => ({ ...c, fees: { ...c.fees, fulfillment_pct: Number(e.target.value) } }))} /></div>
              <div><Label className="mb-1 block text-[11px]">Entrega / orden</Label><Input type="number" min={0} value={cfg.fees.entrega_por_orden} onChange={(e) => setCfg((c) => ({ ...c, fees: { ...c.fees, entrega_por_orden: Number(e.target.value) } }))} /></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feature flags */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ToggleRight className="size-5 text-safety" /> Feature flags</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(cfg.flags) as (keyof typeof cfg.flags)[]).map((k) => (
            <button key={k} type="button" onClick={() => setCfg((c) => ({ ...c, flags: { ...c.flags, [k]: !c.flags[k] } }))} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-left">
              <span className="text-sm text-ink-700">{FLAG_LABEL[k] ?? k}</span>
              <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", cfg.flags[k] ? "bg-safety" : "bg-ink-200")}>
                <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-all", cfg.flags[k] ? "left-[22px]" : "left-0.5")} />
              </span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
