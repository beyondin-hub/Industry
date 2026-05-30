"use client";

import { useState } from "react";
import { Sparkles, Check, X, Loader2, Building, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { INDUSTRIAS } from "@/lib/constants";
import { mxn, fechaHora, cn } from "@/lib/utils";
import { scoreRequest, resolveCreditRequest } from "@/app/(admin)/admin/credito/actions";
import type { CreditRequest } from "@/lib/data/admin";
import type { CreditDecision } from "@/lib/credit/engine";

export function CreditQueue({ requests }: { requests: CreditRequest[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(requests);
  const [resueltas, setResueltas] = useState<Record<string, "aprobado" | "rechazado">>({});

  if (items.length === 0) {
    return <div className="rounded-xl border bg-card py-14 text-center text-ink-600">No hay solicitudes de crédito pendientes. ✅</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <RequestCard
          key={r.id}
          req={r}
          decidida={resueltas[r.id]}
          onResolved={(estado) => {
            setResueltas((m) => ({ ...m, [r.id]: estado }));
            setTimeout(() => setItems((a) => a.filter((x) => x.id !== r.id)), 1200);
          }}
        />
      ))}
    </div>
  );
}

function RequestCard({ req, decidida, onResolved }: { req: CreditRequest; decidida?: "aprobado" | "rechazado"; onResolved: (e: "aprobado" | "rechazado") => void }) {
  const { toast } = useToast();
  const [decision, setDecision] = useState<CreditDecision | null>(null);
  const [limite, setLimite] = useState(req.limite_solicitado);
  const [dias, setDias] = useState(30);
  const [busy, setBusy] = useState(false);
  const industria = INDUSTRIAS.find((i) => i.slug === req.industria)?.nombre ?? req.industria;
  const horas = Math.floor((Date.now() - new Date(req.created_at).getTime()) / 3_600_000);

  async function correr() {
    setBusy(true);
    const d = await scoreRequest({ industria: req.industria, antiguedadMeses: req.antiguedad_meses, gmv6m: req.gmv6m, limiteSolicitado: req.limite_solicitado });
    setBusy(false);
    setDecision(d);
    if (d.aprobado) { setLimite(d.limiteSugerido); setDias(d.dias); }
    toast({ type: d.aprobado ? "success" : "info", title: `Score ${d.score}/100`, description: d.razon });
  }
  async function resolver(aprobar: boolean) {
    setBusy(true);
    const res = await resolveCreditRequest({ requestId: req.id, companyId: req.company_id, empresa: req.empresa, aprobar, limite, dias: dias as 0 | 30 | 60 | 90 });
    setBusy(false);
    if (res.ok) {
      onResolved(aprobar ? "aprobado" : "rechazado");
      toast({ type: aprobar ? "success" : "info", title: aprobar ? `Crédito aprobado · ${req.empresa}` : `Solicitud rechazada`, description: aprobar ? `${mxn(limite)} / ${dias}d` : undefined });
    } else toast({ type: "error", title: "No se pudo", description: res.error });
  }

  return (
    <Card className={cn(decidida === "aprobado" && "border-emerald-300", decidida === "rechazado" && "border-danger/40 opacity-70")}>
      <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-ink-950 text-safety"><Building className="size-4" /></span>
            <p className="font-semibold text-ink-900">{req.empresa}</p>
            <Badge variant="warning"><Clock className="size-3" /> {horas}h</Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-600">
            <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {req.ciudad}</span>
            <span>{industria}</span>
            <span>Solicita <strong className="text-ink-900">{mxn(req.limite_solicitado)}</strong></span>
            <span>GMV 6m {mxn(req.gmv6m)}</span>
            <span>Antigüedad {req.antiguedad_meses}m</span>
            <span>{fechaHora(req.created_at)}</span>
          </div>
          {decision && (
            <div className={cn("mt-2 inline-block rounded-lg px-2.5 py-1 text-xs", decision.aprobado ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>
              Score {decision.score}/100 · {decision.razon}
            </div>
          )}
        </div>

        {decidida ? (
          <Badge variant={decidida === "aprobado" ? "success" : "danger"}>
            {decidida === "aprobado" ? <Check className="size-3" /> : <X className="size-3" />}
            {decidida === "aprobado" ? "Aprobado" : "Rechazado"}
          </Badge>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-end gap-2">
              <div><Label className="mb-1 block text-[10px]">Límite</Label><Input type="number" min={0} step={10000} value={limite} onChange={(e) => setLimite(Number(e.target.value))} className="h-8 w-28 font-mono" /></div>
              <div><Label className="mb-1 block text-[10px]">Días</Label>
                <Select value={String(dias)} onChange={(e) => setDias(Number(e.target.value))} className="h-8 w-20">
                  <option value="30">30</option><option value="60">60</option><option value="90">90</option>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={correr} disabled={busy}><Sparkles className="size-4" /> Scoring</Button>
              <Button variant="ghost" size="sm" onClick={() => resolver(false)} disabled={busy}><X className="size-4 text-danger" /> Rechazar</Button>
              <Button variant="gradient" size="sm" onClick={() => resolver(true)} disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <><Check className="size-4" /> Aprobar</>}</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
