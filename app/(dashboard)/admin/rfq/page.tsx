import {
  ClipboardList,
  Clock,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RFQStatus, UrgenciaBadge } from "@/components/shared/status-badge";
import { CURRENT_COMPANY } from "@/lib/data/account";
import { PROVIDERS } from "@/lib/data/providers";
import { fetchRFQs } from "@/lib/repos/rfqs";
import { mxn, tiempoRestante, num, fechaHora } from "@/lib/utils";

export const metadata = { title: "Mesa de operaciones" };

export default async function AdminRFQPage() {
  const rfqs = await fetchRFQs();
  const abiertos = rfqs.filter((r) => r.estado !== "cerrado");
  const urgentes = rfqs.filter((r) => r.urgencia === "urgente_24h").length;
  const enRiesgo = rfqs.filter(
    (r) => r.estado !== "cerrado" && tiempoRestante(r.deadline_cotizacion).vencido,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mesa de operaciones"
        description="Cumple la garantía de 2 horas: asigna proveedores y genera cotizaciones a tiempo"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="RFQ abiertos" value={String(abiertos.length)} icon={ClipboardList} accent="text-safety" />
        <StatCard label="Urgentes 24h" value={String(urgentes)} icon={AlertTriangle} accent="text-red-600" />
        <StatCard label="SLA en riesgo" value={String(enRiesgo)} icon={Clock} accent="text-amber-600" />
        <StatCard label="Cumplimiento 2h" value="94%" hint="Últimos 30 días" icon={CheckCircle2} accent="text-emerald-600" />
      </div>

      <div className="space-y-4">
        {rfqs.map((rfq) => {
          const t = tiempoRestante(rfq.deadline_cotizacion);
          const candidatos = PROVIDERS.filter((p) =>
            rfq.items.some((it) => {
              const cat = it.descripcion.toLowerCase();
              return p.categorias.some((c) => cat.includes(c.slice(0, 4)));
            }),
          ).slice(0, 3);

          return (
            <Card key={rfq.id} className={t.vencido && rfq.estado !== "cerrado" ? "border-red-200" : ""}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-steel-900">{rfq.folio}</span>
                      <RFQStatus estado={rfq.estado} />
                      <UrgenciaBadge urgencia={rfq.urgencia} />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-steel-500">
                      <Building2 className="size-3.5" /> {CURRENT_COMPANY.nombre} · {CURRENT_COMPANY.ciudad}
                    </p>
                    <p className="text-xs text-steel-400">Recibido {fechaHora(rfq.created_at)}</p>
                  </div>
                  <div className="text-right">
                    {rfq.estado !== "cerrado" ? (
                      <Badge variant={t.vencido ? "danger" : "purplecow"} className="text-sm">
                        <Clock className="size-3.5" /> {t.vencido ? "SLA VENCIDO" : `Quedan ${t.label}`}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Cerrado</Badge>
                    )}
                    <p className="mt-1 text-sm font-semibold text-steel-900">~{mxn(rfq.total_estimado)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="rounded-lg border bg-steel-50/50 p-3">
                  <ul className="space-y-1 text-sm text-steel-700">
                    {rfq.items.map((it) => (
                      <li key={it.id} className="flex items-center gap-2">
                        <span className="font-mono text-xs text-steel-400">{it.numero_parte || "s/n"}</span>
                        <span>{num(it.cantidad)} {it.unidad}</span>
                        <span className="text-steel-500">— {it.descripcion}</span>
                        {it.certificacion_requerida && (
                          <Badge variant="steel" className="text-[10px]">{it.certificacion_requerida}</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                  {rfq.notas && <p className="mt-2 text-xs italic text-steel-500">“{rfq.notas}”</p>}
                </div>

                {/* Asignación de proveedores (matching) */}
                {rfq.estado !== "cerrado" && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-steel-500">Proveedores sugeridos:</span>
                      {candidatos.length > 0 ? (
                        candidatos.map((c) => (
                          <Badge key={c.id} variant="outline">
                            {c.nombre_comercial} · ⭐{c.score}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-steel-400">Buscando match…</span>
                      )}
                    </div>
                    <Button variant="accent" size="sm">
                      <Send className="size-3.5" /> Solicitar cotizaciones
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
