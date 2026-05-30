"use client";

import { useState } from "react";
import { Building, X, Loader2, Sparkles, ShieldCheck, ShieldX, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { mxn, cn } from "@/lib/utils";
import { INDUSTRIAS } from "@/lib/constants";
import { setCreditLine, setKyc, setCompanyEstado, scoreCompany } from "@/app/(admin)/admin/compradores/actions";
import type { BuyerCompany } from "@/lib/data/admin";
import type { CreditDecision } from "@/lib/credit/engine";

export function BuyerManager({ initial }: { initial: BuyerCompany[] }) {
  const [rows, setRows] = useState(initial);
  const [sel, setSel] = useState<BuyerCompany | null>(null);

  function patch(id: string, p: Partial<BuyerCompany>) {
    setRows((a) => a.map((x) => (x.id === id ? { ...x, ...p } : x)));
    setSel((s) => (s && s.id === id ? { ...s, ...p } : s));
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left text-xs text-ink-500">
                  <th className="px-5 py-3 font-medium">Empresa</th>
                  <th className="px-5 py-3 font-medium">Ciudad</th>
                  <th className="px-5 py-3 font-medium">KYC</th>
                  <th className="px-5 py-3 text-right font-medium">Línea</th>
                  <th className="px-5 py-3 text-right font-medium">Exposición</th>
                  <th className="px-5 py-3 font-medium">Uso</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const uso = c.limite_credito > 0 ? Math.round((c.exposicion / c.limite_credito) * 100) : 0;
                  return (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-secondary/30">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ink-900">{c.nombre}</p>
                        <p className="font-mono text-[11px] text-ink-400">{c.rfc}</p>
                      </td>
                      <td className="px-5 py-3 text-ink-600">{c.ciudad}</td>
                      <td className="px-5 py-3">
                        <Badge variant={c.kyc_estado === "verificado" ? "success" : c.kyc_estado === "rechazado" ? "danger" : "warning"}>{c.kyc_estado}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-ink-900">{c.limite_credito > 0 ? `${mxn(c.limite_credito)} · ${c.dias_credito}d` : "—"}</td>
                      <td className="px-5 py-3 text-right text-ink-700">{mxn(c.exposicion)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
                            <div className={cn("h-full rounded-full", uso > 85 ? "bg-danger" : "gradient-accent")} style={{ width: `${Math.min(100, uso)}%` }} />
                          </div>
                          <span className="text-xs text-ink-500">{uso}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3"><Badge variant={c.estado === "activa" ? "success" : "danger"}>{c.estado}</Badge></td>
                      <td className="px-5 py-3 text-right"><Button variant="outline" size="sm" onClick={() => setSel(c)}>Gestionar</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {sel && <BuyerModal company={sel} onClose={() => setSel(null)} onPatch={patch} />}
    </>
  );
}

function BuyerModal({ company, onClose, onPatch }: { company: BuyerCompany; onClose: () => void; onPatch: (id: string, p: Partial<BuyerCompany>) => void }) {
  const { toast } = useToast();
  const [limite, setLimite] = useState(company.limite_credito);
  const [dias, setDias] = useState<number>(company.dias_credito || 30);
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState<CreditDecision | null>(null);

  const industria = INDUSTRIAS.find((i) => i.slug === company.industria)?.nombre ?? company.industria;
  const antiguedadMeses = Math.max(1, Math.round((Date.now() - new Date(company.created_at).getTime()) / (30 * 86_400_000)));

  async function correrScoring() {
    setBusy(true);
    const d = await scoreCompany({ industria: company.industria, antiguedadMeses, gmv6m: company.gmv6m });
    setBusy(false);
    setDecision(d);
    if (d.aprobado) { setLimite(d.limiteSugerido); setDias(d.dias); }
    toast({ type: d.aprobado ? "success" : "info", title: `Score ${d.score}/100`, description: d.razon });
  }
  async function guardar() {
    setBusy(true);
    const res = await setCreditLine({ companyId: company.id, nombre: company.nombre, limite, dias: dias as 0 | 30 | 60 | 90 });
    setBusy(false);
    if (res.ok) { onPatch(company.id, { limite_credito: limite, dias_credito: dias as 0 | 30 | 60 | 90, credito_aprobado: limite > 0 }); toast({ type: "success", title: "Línea actualizada", description: `${mxn(limite)} / ${dias}d` }); }
    else toast({ type: "error", title: "No se pudo", description: res.error });
  }
  async function kyc(estado: "verificado" | "rechazado") {
    const res = await setKyc({ companyId: company.id, estado });
    if (res.ok) { onPatch(company.id, { kyc_estado: estado }); toast({ type: estado === "verificado" ? "success" : "info", title: `KYC ${estado}` }); }
  }
  async function estadoCuenta(estado: "activa" | "suspendida") {
    const res = await setCompanyEstado({ companyId: company.id, estado });
    if (res.ok) { onPatch(company.id, { estado }); toast({ type: estado === "activa" ? "success" : "info", title: estado === "activa" ? "Cuenta reactivada" : "Cuenta suspendida" }); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-ink-900">{company.nombre}</h3>
            <p className="text-xs text-ink-500">{industria} · {company.ciudad} · {mxn(company.gmv6m)} GMV 6m</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-ink-400 hover:text-ink-800"><X className="size-5" /></button>
        </div>

        {/* Crédito */}
        <div className="rounded-xl border p-4">
          <p className="mb-2 text-sm font-semibold text-ink-900">Línea de crédito</p>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="mb-1 block text-[11px]">Límite (MXN)</Label><Input type="number" min={0} step={10000} value={limite} onChange={(e) => setLimite(Number(e.target.value))} className="font-mono" /></div>
            <div>
              <Label className="mb-1 block text-[11px]">Días</Label>
              <Select value={String(dias)} onChange={(e) => setDias(Number(e.target.value))}>
                <option value="0">Contado</option><option value="30">30</option><option value="60">60</option><option value="90">90</option>
              </Select>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={correrScoring} disabled={busy}><Sparkles className="size-4" /> Correr scoring</Button>
            <Button variant="gradient" size="sm" onClick={guardar} disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : "Guardar línea"}</Button>
          </div>
          {decision && (
            <div className={cn("mt-3 rounded-lg p-2.5 text-xs", decision.aprobado ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>
              Score {decision.score}/100 · {decision.razon}
            </div>
          )}
        </div>

        {/* KYC y estado */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3">
            <p className="mb-2 text-xs font-semibold text-ink-700">KYC: <Badge variant={company.kyc_estado === "verificado" ? "success" : company.kyc_estado === "rechazado" ? "danger" : "warning"}>{company.kyc_estado}</Badge></p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => kyc("verificado")}><ShieldCheck className="size-3.5 text-emerald-600" /> Verificar</Button>
              <Button variant="ghost" size="sm" onClick={() => kyc("rechazado")}><ShieldX className="size-3.5 text-danger" /> Rechazar</Button>
            </div>
          </div>
          <div className="rounded-xl border p-3">
            <p className="mb-2 text-xs font-semibold text-ink-700">Cuenta: <Badge variant={company.estado === "activa" ? "success" : "danger"}>{company.estado}</Badge></p>
            {company.estado === "activa"
              ? <Button variant="outline" size="sm" onClick={() => estadoCuenta("suspendida")}>Suspender</Button>
              : <Button variant="gradient" size="sm" onClick={() => estadoCuenta("activa")}><Check className="size-3.5" /> Reactivar</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
