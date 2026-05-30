"use client";

import { useState } from "react";
import { Check, X, ShieldCheck, MapPin, Clock, Loader2, FileSearch, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { categoriaNombre } from "@/lib/constants";
import { fechaHora, cn } from "@/lib/utils";
import { approveProvider, rejectProvider } from "@/app/(admin)/admin/actions";
import type { CategoriaMRO, Provider } from "@/types";

export function ProviderApprovals({ pending }: { pending: Provider[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(pending);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resueltas, setResueltas] = useState<Record<string, "aprobado" | "rechazado">>({});

  async function decidir(p: Provider, accion: "aprobar" | "rechazar") {
    setBusyId(p.id);
    const res = accion === "aprobar"
      ? await approveProvider({ providerId: p.id })
      : await rejectProvider({ providerId: p.id });
    setBusyId(null);
    if (res.ok) {
      setResueltas((r) => ({ ...r, [p.id]: accion === "aprobar" ? "aprobado" : "rechazado" }));
      toast({
        type: accion === "aprobar" ? "success" : "info",
        title: accion === "aprobar" ? `${p.nombre_comercial} aprobado` : `${p.nombre_comercial} rechazado`,
        description: accion === "aprobar" ? "Su catálogo ya puede activarse y recibir RFQs." : "La solicitud quedó cerrada.",
      });
      // Lo quitamos de la lista tras un momento.
      setTimeout(() => setItems((arr) => arr.filter((x) => x.id !== p.id)), 1200);
    } else {
      toast({ type: "error", title: "No se pudo procesar", description: res.error });
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-14 text-center">
        <ShieldCheck className="mx-auto size-8 text-emerald-600" />
        <p className="mt-2 text-sm text-ink-600">No hay solicitudes pendientes. ✅</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((p) => {
        const decidida = resueltas[p.id];
        const horas = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 3_600_000);
        return (
          <Card key={p.id} className={cn(decidida === "aprobado" && "border-emerald-300", decidida === "rechazado" && "border-danger/40 opacity-70")}>
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-ink-950 font-display text-sm font-bold text-white">
                    {p.nombre_comercial.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold text-ink-900">{p.nombre_comercial}</p>
                    <p className="text-xs text-ink-500">{p.razon_social}</p>
                  </div>
                  <Badge variant="warning" className="ml-1"><Clock className="size-3" /> {horas}h en espera</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-600">
                  <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {p.ciudad}</span>
                  <span className="font-mono">RFC: {p.rfc}</span>
                  <span>Recibida {fechaHora(p.created_at)}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.categorias.map((c) => (
                    <Badge key={c} variant="secondary" className="text-[10px]">{categoriaNombre(c as CategoriaMRO)}</Badge>
                  ))}
                  {p.certificaciones.map((c) => (
                    <Badge key={c} variant="steel" className="text-[10px]"><ShieldCheck className="size-2.5" /> {c}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {decidida ? (
                  <Badge variant={decidida === "aprobado" ? "success" : "danger"}>
                    {decidida === "aprobado" ? <Check className="size-3" /> : <X className="size-3" />}
                    {decidida === "aprobado" ? "Aprobado" : "Rechazado"}
                  </Badge>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" title="Validar documentos"><FileSearch className="size-4" /> Revisar</Button>
                    <Button variant="outline" size="sm" disabled={busyId === p.id} onClick={() => decidir(p, "rechazar")}>
                      <X className="size-4 text-danger" /> Rechazar
                    </Button>
                    <Button variant="gradient" size="sm" disabled={busyId === p.id} onClick={() => decidir(p, "aprobar")}>
                      {busyId === p.id ? <Loader2 className="size-4 animate-spin" /> : <><Check className="size-4" /> Aprobar</>}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
