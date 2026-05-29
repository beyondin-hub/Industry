"use client";

import { useState } from "react";
import { FileCheck2, Truck, PackageMinus, CreditCard, MessageCircle, Mail, Globe, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fechaHora, cn } from "@/lib/utils";
import type { Notification, TipoNotificacion } from "@/types";

const META: Record<TipoNotificacion, { icon: any; color: string }> = {
  cotizacion_lista: { icon: FileCheck2, color: "text-emerald-600 bg-emerald-50" },
  orden_en_transito: { icon: Truck, color: "text-safety bg-safety-50" },
  stock_bajo: { icon: PackageMinus, color: "text-amber-600 bg-amber-50" },
  credito_vence: { icon: CreditCard, color: "text-info bg-blue-50" },
};
const CANAL: Record<string, any> = { whatsapp: MessageCircle, email: Mail, web: Globe };

export function NotificationCenter({ initial }: { initial: Notification[] }) {
  const [items, setItems] = useState(initial);
  const [filtro, setFiltro] = useState<"todas" | "no_leidas">("todas");

  const visibles = filtro === "no_leidas" ? items.filter((n) => !n.leida) : items;
  const noLeidas = items.filter((n) => !n.leida).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro("todas")}
            className={cn("rounded-full px-3 py-1 text-sm font-medium", filtro === "todas" ? "bg-ink-950 text-white" : "text-ink-600 hover:bg-secondary")}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro("no_leidas")}
            className={cn("rounded-full px-3 py-1 text-sm font-medium", filtro === "no_leidas" ? "bg-ink-950 text-white" : "text-ink-600 hover:bg-secondary")}
          >
            No leídas {noLeidas > 0 && <Badge variant="accent" className="ml-1">{noLeidas}</Badge>}
          </button>
        </div>
        {noLeidas > 0 && (
          <Button variant="outline" size="sm" onClick={() => setItems((a) => a.map((n) => ({ ...n, leida: true })))}>
            <Check className="size-4" /> Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {visibles.length === 0 && <p className="py-12 text-center text-sm text-ink-500">Sin notificaciones.</p>}
        {visibles.map((n) => {
          const m = META[n.tipo];
          const Icon = m.icon;
          const Canal = CANAL[n.canal];
          return (
            <button
              key={n.id}
              onClick={() => setItems((a) => a.map((x) => (x.id === n.id ? { ...x, leida: true } : x)))}
              className={cn("flex w-full items-start gap-3 border-b p-4 text-left last:border-0 hover:bg-secondary/40", !n.leida && "bg-safety-50/40")}
            >
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", m.color)}>
                <Icon className="size-4" />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">{n.titulo}</p>
                  {!n.leida && <span className="size-2 rounded-full bg-safety" />}
                </div>
                <p className="mt-0.5 text-sm text-ink-600">{n.mensaje}</p>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-400">
                  <span className="flex items-center gap-1"><Canal className="size-3" /> {n.canal}</span>
                  <span>·</span>
                  <span>{fechaHora(n.created_at)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
