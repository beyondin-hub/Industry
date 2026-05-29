"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Upload,
  Zap,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getProduct } from "@/lib/data/products";
import { CERTIFICACIONES } from "@/lib/constants";
import type { CondicionPago, Urgencia } from "@/types";

interface ItemForm {
  descripcion: string;
  numero_parte: string;
  cantidad: number;
  unidad: string;
  certificacion: string;
}

const emptyItem = (): ItemForm => ({
  descripcion: "",
  numero_parte: "",
  cantidad: 1,
  unidad: "pza",
  certificacion: "",
});

export function RFQForm({ presetSku, presetQty }: { presetSku?: string; presetQty?: number }) {
  const preset = presetSku ? getProduct(presetSku) : undefined;

  const [items, setItems] = useState<ItemForm[]>([
    preset
      ? {
          descripcion: preset.nombre,
          numero_parte: preset.numero_parte,
          cantidad: presetQty ?? 1,
          unidad: preset.unidad,
          certificacion: "",
        }
      : emptyItem(),
  ]);
  const [urgencia, setUrgencia] = useState<Urgencia>("normal");
  const [pago, setPago] = useState<CondicionPago>("60");
  const [cfdi, setCfdi] = useState(true);
  const [notas, setNotas] = useState("");
  const [enviado, setEnviado] = useState<{ folio: string; deadline: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function updateItem(i: number, patch: Partial<ItemForm>) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, urgencia, condicion_pago: pago, requiere_cfdi: cfdi, notas }),
      });
      const data = await res.json();
      setEnviado({ folio: data.folio, deadline: data.deadline_label });
    } catch {
      setEnviado({ folio: "MRO-2026-0152", deadline: "2 horas hábiles" });
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <Card className="mx-auto max-w-xl border-emerald-200">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <CheckCircle2 className="size-14 text-emerald-600" />
          <h2 className="text-xl font-bold text-steel-950">¡RFQ recibido! {enviado.folio}</h2>
          <p className="text-steel-600">
            Nuestra mesa de operaciones ya está consiguiendo tus precios. Recibirás la
            cotización por WhatsApp y email.
          </p>
          <Badge variant="purplecow" className="text-sm">
            <Clock className="size-3.5" /> Cotización garantizada en {enviado.deadline}
          </Badge>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" onClick={() => setEnviado(null)}>
              Crear otro RFQ
            </Button>
            <a href="/dashboard"><Button variant="accent">Ir al dashboard</Button></a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Items */}
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-steel-900">Partidas a cotizar</h2>
              <Badge variant="secondary">{items.length} ítem(s)</Badge>
            </div>

            {items.map((item, i) => (
              <div key={i} className="rounded-lg border bg-steel-50/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-steel-700">Partida {i + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setItems((a) => a.filter((_, idx) => idx !== i))}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="mb-1 block">Descripción del insumo *</Label>
                    <Input
                      required
                      value={item.descripcion}
                      onChange={(e) => updateItem(i, { descripcion: e.target.value })}
                      placeholder="Ej. Balero rígido de bolas 6205 sellado"
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Número de parte</Label>
                    <Input
                      value={item.numero_parte}
                      onChange={(e) => updateItem(i, { numero_parte: e.target.value })}
                      placeholder="Opcional"
                      className="font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="mb-1 block">Cantidad *</Label>
                      <Input
                        type="number"
                        min={1}
                        required
                        value={item.cantidad}
                        onChange={(e) => updateItem(i, { cantidad: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block">Unidad</Label>
                      <Select value={item.unidad} onChange={(e) => updateItem(i, { unidad: e.target.value })}>
                        <option value="pza">pza</option>
                        <option value="par">par</option>
                        <option value="caja">caja</option>
                        <option value="kit">kit</option>
                        <option value="galón">galón</option>
                        <option value="cubeta">cubeta</option>
                        <option value="m">metro</option>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1 block">Certificación requerida</Label>
                    <Select
                      value={item.certificacion}
                      onChange={(e) => updateItem(i, { certificacion: e.target.value })}
                    >
                      <option value="">No aplica</option>
                      {CERTIFICACIONES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-steel-300 text-sm text-steel-500 hover:border-safety hover:text-safety">
                      <Upload className="size-4" /> Subir foto del componente
                      <input type="file" accept="image/*" className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={() => setItems((a) => [...a, emptyItem()])}>
              <Plus className="size-4" /> Agregar partida
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Label className="mb-1 block">Notas para la mesa de operaciones</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Línea 3 detenida, se requiere entrega mañana a primera hora en planta Otay."
            />
          </CardContent>
        </Card>
      </div>

      {/* Side panel */}
      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card className="border-purplecow-100 bg-purplecow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-purplecow-600">
              <Zap className="size-5" />
              <span className="font-semibold">Garantía 2 horas</span>
            </div>
            <p className="mt-1.5 text-sm text-steel-700">
              Cotización confirmada en 2 horas hábiles o tu siguiente orden va con{" "}
              <strong>0% de comisión</strong>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <Label className="mb-1.5 block">Urgencia</Label>
              <Select value={urgencia} onChange={(e) => setUrgencia(e.target.value as Urgencia)}>
                <option value="urgente_24h">🔴 Urgente — necesito en 24h</option>
                <option value="normal">Normal — 2-3 días</option>
                <option value="programado">Programado — fecha futura</option>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Condición de pago</Label>
              <Select value={pago} onChange={(e) => setPago(e.target.value as CondicionPago)}>
                <option value="contado">Contado</option>
                <option value="30">Crédito 30 días</option>
                <option value="60">Crédito 60 días</option>
                <option value="90">Crédito 90 días</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm text-steel-700">
              <input
                type="checkbox"
                checked={cfdi}
                onChange={(e) => setCfdi(e.target.checked)}
                className="size-4 rounded border-steel-300"
              />
              Requiero CFDI (factura fiscal)
            </label>

            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
              <FileSpreadsheet className="size-4" />
              {loading ? "Enviando…" : "Enviar solicitud de cotización"}
            </Button>
            <p className="text-center text-xs text-steel-500">
              Sin compromiso · Recibe múltiples ofertas de proveedores certificados
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
