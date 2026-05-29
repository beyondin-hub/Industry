"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Wallet, TrendingUp, Check, Loader2, Sparkles, X, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { mxn, fechaCorta, cn } from "@/lib/utils";
import { payOrder, requestCreditIncrease, type CreditDecisionResult } from "@/app/(dashboard)/credito/actions";

export interface CreditVM {
  limite: number; usado: number; disponible: number; utilizacionPct: number; dias: number;
}
export interface CreditOrderVM {
  id: string; folio: string; total: number; vence?: string; pagado: boolean; proveedor: string;
}

export function CreditPanel({ profile, orders }: { profile: CreditVM; orders: CreditOrderVM[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pagados, setPagados] = useState<string[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

  const porPagar = orders.filter((o) => !o.pagado && !pagados.includes(o.id));
  const pagadasList = orders.filter((o) => o.pagado || pagados.includes(o.id));

  async function pagar(o: CreditOrderVM) {
    setPayingId(o.id);
    const res = await payOrder({ orderId: o.id, monto: o.total });
    setPayingId(null);
    if (res.ok) {
      setPagados((p) => [...p, o.id]);
      toast({ type: "success", title: `Pago registrado · ${o.folio}`, description: mxn(o.total) + " vía SPEI" });
      router.refresh();
    } else {
      toast({ type: "error", title: "No se pudo registrar el pago", description: res.error });
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Línea aprobada" value={mxn(profile.limite)} hint={`${profile.dias} días`} icon={CreditCard} accent="text-info" />
        <StatCard label="Disponible" value={mxn(profile.disponible)} hint={`${profile.utilizacionPct}% utilizado`} icon={Wallet} accent="text-emerald-600" />
        <StatCard label="Exposición vigente" value={mxn(profile.usado)} hint={`${porPagar.length} órdenes por pagar`} icon={TrendingUp} accent="text-safety" />
      </div>

      {/* Barra de utilización */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-ink-800">Uso de tu línea</span>
            <span className="text-ink-500">{mxn(profile.usado)} / {mxn(profile.limite)}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className={cn("h-full rounded-full", profile.utilizacionPct > 85 ? "bg-danger" : "gradient-accent")}
              style={{ width: `${Math.min(100, profile.utilizacionPct)}%` }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs text-ink-500">
              <Sparkles className="size-3.5 text-safety" /> Crédito otorgado por Novak (vía SOFOM partner)
            </p>
            <Button variant="outline" size="sm" onClick={() => setModal(true)}>Solicitar ampliación</Button>
          </div>
        </CardContent>
      </Card>

      {/* Por pagar */}
      <Card>
        <CardHeader><CardTitle>Facturas por pagar</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {porPagar.length === 0 && <p className="py-6 text-center text-sm text-ink-500">Sin saldos pendientes 🎉</p>}
          {porPagar.map((o) => {
            const vencido = o.vence && new Date(o.vence).getTime() < Date.now();
            return (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3.5">
                <div>
                  <span className="font-mono text-sm font-semibold text-ink-900">{o.folio}</span>
                  <p className="text-xs text-ink-500">{o.proveedor}</p>
                </div>
                <div className="flex items-center gap-3">
                  {o.vence && (
                    <Badge variant={vencido ? "danger" : "warning"}>
                      {vencido ? <AlertTriangle className="size-3" /> : null} Vence {fechaCorta(o.vence)}
                    </Badge>
                  )}
                  <span className="font-semibold text-ink-900">{mxn(o.total)}</span>
                  <Button size="sm" variant="gradient" disabled={payingId === o.id} onClick={() => pagar(o)}>
                    {payingId === o.id ? <Loader2 className="size-4 animate-spin" /> : "Pagar"}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pagadas */}
      {pagadasList.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Historial de pagos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pagadasList.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span className="font-mono font-semibold text-ink-900">{o.folio}</span>
                <span className="text-ink-500">{o.proveedor}</span>
                <span className="flex items-center gap-1.5 text-emerald-600"><Check className="size-4" /> Pagado</span>
                <span className="font-semibold text-ink-900">{mxn(o.total)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {modal && <CreditModal onClose={() => setModal(false)} sugerido={profile.limite * 1.5} />}
    </div>
  );
}

function CreditModal({ onClose, sugerido }: { onClose: () => void; sugerido: number }) {
  const { toast } = useToast();
  const [monto, setMonto] = useState(Math.round(sugerido / 1000) * 1000);
  const [pending, setPending] = useState(false);
  const [decision, setDecision] = useState<CreditDecisionResult | null>(null);

  async function solicitar() {
    setPending(true);
    const res = await requestCreditIncrease({ limiteSolicitado: monto });
    setPending(false);
    setDecision(res);
    toast({ type: res.aprobado ? "success" : "info", title: res.aprobado ? "¡Pre-aprobado!" : "En revisión", description: res.razon });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink-900">Solicitar ampliación de línea</h3>
          <button onClick={onClose} aria-label="Cerrar" className="text-ink-400 hover:text-ink-800"><X className="size-5" /></button>
        </div>

        {!decision ? (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Límite solicitado (MXN)</Label>
              <Input type="number" min={0} step={10000} value={monto} onChange={(e) => setMonto(Number(e.target.value))} className="font-mono" />
            </div>
            <p className="text-xs text-ink-500">Novak evalúa tu historial de compra, antigüedad e industria con su motor de crédito.</p>
            <Button variant="gradient" className="w-full" onClick={solicitar} disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <><Sparkles className="size-4" /> Evaluar mi crédito</>}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className={cn("mx-auto flex size-14 items-center justify-center rounded-full", decision.aprobado ? "bg-emerald-100" : "bg-amber-100")}>
              {decision.aprobado ? <Check className="size-7 text-emerald-600" /> : <AlertTriangle className="size-7 text-amber-600" />}
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold text-ink-950">Score {decision.score}/100</p>
              <p className="mt-1 text-sm text-ink-600">{decision.razon}</p>
            </div>
            {decision.aprobado && (
              <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                Línea pre-aprobada: <strong>{mxn(decision.limiteSugerido)}</strong> a <strong>{decision.dias} días</strong>.
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={onClose}>Cerrar</Button>
          </div>
        )}
      </div>
    </div>
  );
}
