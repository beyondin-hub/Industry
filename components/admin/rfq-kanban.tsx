"use client";

import { useMemo, useState } from "react";
import {
  DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  Clock, Building2, Send, X, Sparkles, AlertTriangle, MessageCircle, GripVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UrgenciaBadge } from "@/components/shared/status-badge";
import { useToast } from "@/components/ui/toast";
import { PROVIDERS } from "@/lib/data/providers";
import { mxn, num, fechaHora, cn } from "@/lib/utils";
import type { EstadoRFQ, RFQ } from "@/types";

const COLUMNS: { estado: EstadoRFQ; label: string; tint: string }[] = [
  { estado: "nuevo", label: "Nuevo", tint: "border-t-ink-400" },
  { estado: "en_proceso", label: "En proceso", tint: "border-t-amber-400" },
  { estado: "cotizado", label: "Cotizado", tint: "border-t-safety" },
  { estado: "aprobado", label: "Cerrado ganado", tint: "border-t-emerald-500" },
  { estado: "cerrado", label: "Cerrado perdido", tint: "border-t-ink-300" },
];

function minutosRestantes(iso: string) {
  return Math.floor((new Date(iso).getTime() - Date.now()) / 60000);
}

export function RFQKanban({ initial, companyName }: { initial: RFQ[]; companyName: string }) {
  const { toast } = useToast();
  const [rfqs, setRfqs] = useState<RFQ[]>(initial);
  const [selected, setSelected] = useState<RFQ | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function onDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    const target = e.over?.id as EstadoRFQ | undefined;
    if (!target) return;
    setRfqs((prev) => prev.map((r) => (r.id === id ? { ...r, estado: target } : r)));
    const col = COLUMNS.find((c) => c.estado === target);
    toast({ type: "success", title: "RFQ movido", description: `→ ${col?.label}` });
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-3">
          {COLUMNS.map((col) => {
            const cards = rfqs.filter((r) => r.estado === col.estado);
            return (
              <Column key={col.estado} estado={col.estado} label={col.label} tint={col.tint} count={cards.length}>
                {cards.map((r) => (
                  <KanbanCard key={r.id} rfq={r} companyName={companyName} onOpen={() => setSelected(r)} />
                ))}
              </Column>
            );
          })}
        </div>
      </DndContext>

      {selected && (
        <DetailPanel rfq={selected} companyName={companyName} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function Column({ estado, label, tint, count, children }: {
  estado: string; label: string; tint: string; count: number; children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border border-t-4 bg-secondary/40 transition-colors",
        tint,
        isOver && "bg-safety-50 ring-2 ring-safety/40",
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-sm font-semibold text-ink-800">{label}</span>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <div className="flex-1 space-y-2 p-2">{children}</div>
    </div>
  );
}

function KanbanCard({ rfq, companyName, onOpen }: { rfq: RFQ; companyName: string; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: rfq.id });
  const min = minutosRestantes(rfq.deadline_cotizacion);
  const cerrado = rfq.estado === "aprobado" || rfq.estado === "cerrado";
  const critico = !cerrado && min < 30;
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm",
        isDragging && "opacity-50",
        critico && "border-danger ring-1 ring-danger/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <span className="font-mono text-xs font-semibold text-ink-900">{rfq.folio}</span>
        </button>
        <button {...attributes} {...listeners} className="cursor-grab text-ink-300 hover:text-ink-500" aria-label="Mover">
          <GripVertical className="size-4" />
        </button>
      </div>
      <button onClick={onOpen} className="mt-1 block w-full text-left">
        <p className="flex items-center gap-1 text-[11px] text-ink-500">
          <Building2 className="size-3" /> {companyName}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-ink-600">
          {rfq.items.map((i) => `${num(i.cantidad)} ${i.descripcion}`).join(" · ")}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <UrgenciaBadge urgencia={rfq.urgencia} />
          <span className="font-mono text-xs font-semibold text-ink-900">~{mxn(rfq.total_estimado)}</span>
        </div>
        {!cerrado && (
          <div className={cn(
            "mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold",
            critico ? "bg-danger/10 text-danger" : "bg-purplecow-50 text-purplecow-600",
          )}>
            {critico ? <AlertTriangle className="size-3" /> : <Clock className="size-3" />}
            {min <= 0 ? "SLA VENCIDO" : critico ? `¡${min} min para SLA!` : `${Math.floor(min / 60)}h ${min % 60}m`}
          </div>
        )}
      </button>
    </div>
  );
}

function DetailPanel({ rfq, companyName, onClose }: { rfq: RFQ; companyName: string; onClose: () => void }) {
  const { toast } = useToast();
  // AI supplier match: proveedores cuya categoría aparece en las partidas.
  const sugeridos = useMemo(() => {
    const texto = rfq.items.map((i) => i.descripcion.toLowerCase()).join(" ");
    return PROVIDERS
      .map((p) => ({
        p,
        score: p.categorias.filter((c) => texto.includes(c.slice(0, 4))).length + p.score / 10,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.p);
  }, [rfq]);
  const min = minutosRestantes(rfq.deadline_cotizacion);
  const cerrado = rfq.estado === "aprobado" || rfq.estado === "cerrado";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink-950/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-[min(92vw,440px)] flex-col bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="font-mono text-sm font-bold text-ink-900">{rfq.folio}</p>
            <p className="flex items-center gap-1 text-xs text-ink-500"><Building2 className="size-3" /> {companyName}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-ink-400 hover:text-ink-800"><X className="size-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {!cerrado && (
            <div className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold",
              min < 30 ? "bg-danger/10 text-danger" : "bg-purplecow-50 text-purplecow-600",
            )}>
              <Clock className="size-4" />
              {min <= 0 ? "Garantía 2h VENCIDA" : `Quedan ${Math.floor(min / 60)}h ${min % 60}m de la garantía 2h`}
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Partidas</p>
            <div className="space-y-2">
              {rfq.items.map((it) => (
                <div key={it.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium text-ink-900">{it.descripcion}</p>
                  <p className="font-mono text-xs text-ink-400">{it.numero_parte || "s/n"} · {num(it.cantidad)} {it.unidad}</p>
                  {it.certificacion_requerida && <Badge variant="steel" className="mt-1 text-[10px]">{it.certificacion_requerida}</Badge>}
                </div>
              ))}
            </div>
            {rfq.notas && <p className="mt-2 rounded-lg bg-secondary/50 p-2 text-xs italic text-ink-600">“{rfq.notas}”</p>}
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <Sparkles className="size-3.5 text-safety" /> Proveedores sugeridos (AI match)
            </p>
            <div className="space-y-2">
              {sugeridos.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{p.nombre_comercial}</p>
                    <p className="text-xs text-ink-500">⭐ {p.score} · {p.ciudad} · {p.certificaciones.join(", ")}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast({ type: "success", title: `Solicitud enviada a ${p.nombre_comercial}`, description: "Plantilla WhatsApp/email generada." })}
                  >
                    <Send className="size-3.5" /> Enviar
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-dashed p-3 text-xs text-ink-500">
            Recibido {fechaHora(rfq.created_at)} · Pago: {rfq.condicion_pago === "contado" ? "contado" : `${rfq.condicion_pago} días`} · {rfq.requiere_cfdi ? "Con CFDI" : "Sin CFDI"}
          </div>
        </div>

        <div className="flex gap-2 border-t p-4">
          <Button
            variant="gradient"
            className="flex-1"
            onClick={() => toast({ type: "success", title: "Cotización enviada al comprador", description: `${rfq.folio} · garantía cumplida` })}
          >
            <Send className="size-4" /> Enviar cotización al comprador
          </Button>
          <a
            href="https://wa.me/526640000000"
            className="inline-flex h-10 items-center justify-center rounded-md border px-3 text-emerald-700 hover:bg-secondary"
            aria-label="WhatsApp"
          >
            <MessageCircle className="size-4" />
          </a>
        </div>
      </aside>
    </div>
  );
}
