"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, ShieldCheck, Truck, Check, Loader2, CreditCard, Banknote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { mxn, fechaCorta, entregaLabel } from "@/lib/utils";
import { acceptQuotation } from "@/app/(dashboard)/credito/actions";

export interface QuoteVM {
  id: string;
  folio: string;
  rfqFolio: string;
  proveedor: string;
  ciudad: string;
  score: number;
  subtotal: number;
  comision: number;
  iva: number;
  total: number;
  tiempo_entrega_horas: number;
  condicion_pago: string;
  valida_hasta: string;
  categoria?: string;
  providerId?: string;
}

export function QuotationList({ quotes, creditoDisponible }: { quotes: QuoteVM[]; creditoDisponible: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [aceptadas, setAceptadas] = useState<Record<string, string>>({});

  async function aceptar(q: QuoteVM, viaCredito: boolean) {
    setPendingId(q.id);
    const res = await acceptQuotation({
      quotationId: q.id, total: q.total, viaCredito, categoria: q.categoria, providerId: q.providerId,
    });
    setPendingId(null);
    if (res.ok && res.folio) {
      setAceptadas((a) => ({ ...a, [q.id]: res.folio! }));
      toast({ type: "success", title: `Orden ${res.folio} creada`, description: viaCredito ? "Aprobada con tu línea de crédito." : "Pago de contado." });
      router.refresh();
    } else {
      toast({ type: "error", title: "No se pudo aceptar", description: res.error });
    }
  }

  if (quotes.length === 0) {
    return <div className="rounded-xl border bg-card py-16 text-center text-ink-500">No tienes cotizaciones por aprobar.</div>;
  }

  return (
    <div className="space-y-4">
      {quotes.map((q) => {
        const aceptada = aceptadas[q.id];
        const puedeCredito = q.condicion_pago !== "contado" && creditoDisponible >= q.total;
        return (
          <Card key={q.id} className={aceptada ? "border-emerald-300" : ""}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-ink-900">{q.folio}</span>
                    <Badge variant="secondary">RFQ {q.rfqFolio}</Badge>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-600">
                    <ShieldCheck className="size-3.5 text-emerald-600" /> {q.proveedor} · ⭐ {q.score} · {q.ciudad}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="success"><Truck className="size-3" /> {entregaLabel(q.tiempo_entrega_horas, q.ciudad)}</Badge>
                    <Badge variant="steel"><Clock className="size-3" /> Válida hasta {fechaCorta(q.valida_hasta)}</Badge>
                    <Badge variant="secondary">{q.condicion_pago === "contado" ? "Contado" : `Crédito ${q.condicion_pago}d`}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-extrabold text-ink-950">{mxn(q.total)}</p>
                  <p className="text-xs text-ink-500">IVA incluido</p>
                </div>
              </div>

              {/* Desglose */}
              <div className="mt-4 grid gap-1.5 rounded-lg bg-secondary/40 p-3 text-sm sm:grid-cols-3">
                <Desg k="Subtotal" v={mxn(q.subtotal)} />
                <Desg k="Comisión Novak" v={mxn(q.comision)} />
                <Desg k="IVA" v={mxn(q.iva)} />
              </div>

              {aceptada ? (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  <Check className="size-4" /> Aceptada — orden {aceptada} creada
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                  {q.condicion_pago !== "contado" && (
                    <Button variant="gradient" disabled={!puedeCredito || pendingId === q.id} onClick={() => aceptar(q, true)}>
                      {pendingId === q.id ? <Loader2 className="size-4 animate-spin" /> : <><CreditCard className="size-4" /> Aceptar a crédito {q.condicion_pago}d</>}
                    </Button>
                  )}
                  <Button variant={q.condicion_pago === "contado" ? "gradient" : "outline"} disabled={pendingId === q.id} onClick={() => aceptar(q, false)}>
                    <Banknote className="size-4" /> Aceptar de contado
                  </Button>
                </div>
              )}
              {q.condicion_pago !== "contado" && !puedeCredito && !aceptada && (
                <p className="mt-1 text-right text-xs text-danger">Línea de crédito insuficiente para esta orden.</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Desg({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between sm:flex-col sm:items-start">
      <span className="text-xs text-ink-500">{k}</span>
      <span className="font-medium text-ink-900">{v}</span>
    </div>
  );
}
