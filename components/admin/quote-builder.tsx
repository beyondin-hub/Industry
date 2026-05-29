"use client";

import { useMemo, useState } from "react";
import { FileSpreadsheet, Send, Check, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { mxn, num } from "@/lib/utils";
import { desgloseCotizacion } from "@/lib/credit/engine";
import { createQuotation } from "@/app/(admin)/admin/actions";

export interface RFQVM {
  id: string;
  folio: string;
  empresa: string;
  condicion_pago: string;
  items: { id: string; descripcion: string; numero_parte?: string; cantidad: number; unidad: string }[];
}
export interface ProvVM { id: string; nombre: string; score: number }

export function QuoteBuilder({ rfqs, providers }: { rfqs: RFQVM[]; providers: ProvVM[] }) {
  const { toast } = useToast();
  const [rfqId, setRfqId] = useState(rfqs[0]?.id ?? "");
  const rfq = rfqs.find((r) => r.id === rfqId);
  const [providerId, setProviderId] = useState(providers[0]?.id ?? "");
  const [comisionPct, setComisionPct] = useState(12);
  const [tiempo, setTiempo] = useState(24);
  const [precios, setPrecios] = useState<Record<string, number>>({});
  const [pending, setPending] = useState(false);
  const [creada, setCreada] = useState<string | null>(null);

  const subtotal = useMemo(() => {
    if (!rfq) return 0;
    return rfq.items.reduce((s, it) => s + (precios[it.id] ?? 0) * it.cantidad, 0);
  }, [rfq, precios]);

  const desglose = desgloseCotizacion(subtotal, comisionPct / 100);

  async function generar() {
    if (!rfq || subtotal <= 0) {
      toast({ type: "error", title: "Captura los precios de las partidas" });
      return;
    }
    setPending(true);
    const res = await createQuotation({
      rfqId: rfq.id, providerId, subtotal, comisionPct: comisionPct / 100,
      tiempoEntregaHoras: tiempo, condicionPago: rfq.condicion_pago,
    });
    setPending(false);
    if (res.ok) {
      setCreada(res.folio!);
      toast({ type: "success", title: `Cotización ${res.folio} enviada`, description: "El comprador ya puede aceptarla." });
    } else {
      toast({ type: "error", title: "No se pudo generar", description: res.error });
    }
  }

  if (rfqs.length === 0) {
    return <div className="rounded-xl border bg-card py-16 text-center text-ink-500">No hay RFQ pendientes de cotizar.</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">RFQ</Label>
              <Select value={rfqId} onChange={(e) => { setRfqId(e.target.value); setPrecios({}); setCreada(null); }}>
                {rfqs.map((r) => <option key={r.id} value={r.id}>{r.folio} · {r.empresa}</option>)}
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Proveedor asignado</Label>
              <Select value={providerId} onChange={(e) => setProviderId(e.target.value)}>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.nombre} (⭐{p.score})</option>)}
              </Select>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left text-xs text-ink-500">
                  <th className="px-3 py-2 font-medium">Partida</th>
                  <th className="px-3 py-2 text-right font-medium">Cant.</th>
                  <th className="px-3 py-2 text-right font-medium">Precio unit.</th>
                  <th className="px-3 py-2 text-right font-medium">Importe</th>
                </tr>
              </thead>
              <tbody>
                {rfq?.items.map((it) => {
                  const precio = precios[it.id] ?? 0;
                  return (
                    <tr key={it.id} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <p className="font-medium text-ink-900">{it.descripcion}</p>
                        <p className="font-mono text-[11px] text-ink-400">{it.numero_parte || "s/n"}</p>
                      </td>
                      <td className="px-3 py-2 text-right text-ink-600">{num(it.cantidad)} {it.unidad}</td>
                      <td className="px-3 py-2 text-right">
                        <Input type="number" min={0} value={precio || ""} onChange={(e) => setPrecios((p) => ({ ...p, [it.id]: Number(e.target.value) }))} className="h-8 w-24 text-right" placeholder="0.00" />
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-ink-900">{mxn(precio * it.cantidad)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Comisión Novak: {comisionPct}%</Label>
              <input type="range" min={8} max={15} value={comisionPct} onChange={(e) => setComisionPct(Number(e.target.value))} className="w-full accent-safety" />
            </div>
            <div>
              <Label className="mb-1.5 block">Tiempo de entrega (h)</Label>
              <Select value={tiempo} onChange={(e) => setTiempo(Number(e.target.value))}>
                <option value={24}>24 horas</option>
                <option value={48}>24-48 horas</option>
                <option value={72}>2-3 días</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen / desglose en vivo */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <Card className="bg-ink-950 text-white">
          <CardContent className="space-y-3 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-200"><FileSpreadsheet className="size-4 text-safety" /> Cotización para el comprador</p>
            <div className="space-y-1.5 text-sm">
              <Row k="Subtotal (proveedor)" v={mxn(desglose.subtotal)} />
              <Row k={`Comisión Novak (${comisionPct}%)`} v={mxn(desglose.comision)} />
              <Row k="IVA" v={mxn(desglose.iva)} />
              <div className="border-t border-white/10 pt-2">
                <Row k="Total" v={mxn(desglose.total)} bold />
              </div>
            </div>
            {creada ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-400">
                <Check className="size-4" /> Enviada: {creada}
              </div>
            ) : (
              <Button variant="gradient" className="w-full" onClick={generar} disabled={pending || subtotal <= 0}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <><Send className="size-4" /> Generar y enviar</>}
              </Button>
            )}
            <p className="flex items-center gap-1.5 text-[11px] text-ink-400">
              <Sparkles className="size-3 text-safety" /> Cierra el loop: el comprador la verá en “Cotizaciones”.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-semibold text-white" : "text-ink-300"}>{k}</span>
      <span className={bold ? "font-display text-lg font-extrabold text-gradient" : "font-mono text-white"}>{v}</span>
    </div>
  );
}
