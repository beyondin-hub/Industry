"use client";

import { useState } from "react";
import { Send, Loader2, ShieldAlert, Building, Store, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { redactContact } from "@/lib/anti-bypass";
import { fechaHora, cn } from "@/lib/utils";
import { replyTicket, setTicketStatus } from "@/app/(admin)/admin/soporte/actions";
import type { Ticket, TicketMessage } from "@/lib/data/admin";

const ESTADO_VAR: Record<string, any> = { abierto: "warning", en_proceso: "accent", resuelto: "success" };
const PRIO_VAR: Record<string, any> = { alta: "danger", media: "warning", baja: "secondary" };

export function SupportCenter({ tickets }: { tickets: Ticket[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(tickets);
  const [selId, setSelId] = useState(tickets[0]?.id ?? "");
  const [filtro, setFiltro] = useState("todos");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const visibles = filtro === "todos" ? items : items.filter((t) => t.estado === filtro);
  const sel = items.find((t) => t.id === selId);
  const preview = redactContact(input);

  async function enviar() {
    if (!sel || !input.trim()) return;
    setSending(true);
    const res = await replyTicket({ ticketId: sel.id, asunto: sel.asunto, cuerpo: input });
    setSending(false);
    if (res.ok) {
      const msg: TicketMessage = { remitente: "novak", cuerpo: res.cuerpo!, created_at: new Date().toISOString() };
      setItems((a) => a.map((t) => (t.id === sel.id ? { ...t, mensajes: [...t.mensajes, msg], estado: "en_proceso" } : t)));
      setInput("");
    } else toast({ type: "error", title: "No se pudo enviar", description: res.error });
  }
  async function cambiarEstado(estado: "abierto" | "en_proceso" | "resuelto") {
    if (!sel) return;
    setItems((a) => a.map((t) => (t.id === sel.id ? { ...t, estado } : t)));
    await setTicketStatus({ ticketId: sel.id, asunto: sel.asunto, estado });
    toast({ type: "success", title: `Ticket → ${estado.replace("_", " ")}` });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* Lista */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {["todos", "abierto", "en_proceso", "resuelto"].map((f) => (
            <button key={f} onClick={() => setFiltro(f)} className={cn("rounded-full px-2.5 py-1 text-xs font-medium", filtro === f ? "bg-ink-950 text-white" : "border text-ink-600 hover:bg-secondary")}>{f.replace("_", " ")}</button>
          ))}
        </div>
        <div className="space-y-2">
          {visibles.map((t) => (
            <button key={t.id} onClick={() => setSelId(t.id)} className={cn("w-full rounded-xl border p-3 text-left transition-colors", selId === t.id ? "border-safety bg-safety-50" : "bg-card hover:border-ink-300")}>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs text-ink-500">{t.origen === "comprador" ? <Building className="size-3.5" /> : <Store className="size-3.5" />} {t.origen_nombre}</span>
                <Badge variant={PRIO_VAR[t.prioridad]} className="text-[10px]">{t.prioridad === "alta" && <AlertTriangle className="size-2.5" />} {t.prioridad}</Badge>
              </div>
              <p className="mt-1 line-clamp-1 text-sm font-semibold text-ink-900">{t.asunto}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">{t.tipo}</Badge>
                <Badge variant={ESTADO_VAR[t.estado]} className="text-[10px]">{t.estado.replace("_", " ")}</Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversación */}
      {sel ? (
        <Card className="flex h-[600px] flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
            <div>
              <p className="font-display font-semibold text-ink-900">{sel.asunto}</p>
              <p className="text-xs text-ink-500">{sel.origen_nombre} · {sel.tipo}</p>
            </div>
            <Select value={sel.estado} onChange={(e) => cambiarEstado(e.target.value as any)} className="h-8 w-36">
              <option value="abierto">Abierto</option><option value="en_proceso">En proceso</option><option value="resuelto">Resuelto</option>
            </Select>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-secondary/30 p-4">
            {sel.mensajes.map((m, i) => {
              const novak = m.remitente === "novak";
              return (
                <div key={i} className={cn("flex", novak ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm", novak ? "rounded-br-sm bg-ink-950 text-white" : "rounded-bl-sm border bg-card text-ink-800")}>
                    <p className={cn("mb-0.5 text-[10px] font-semibold uppercase", novak ? "text-safety" : "text-ink-400")}>{novak ? "Novak" : m.remitente}</p>
                    <p>{m.cuerpo}</p>
                    <p className="mt-1 text-[10px] text-ink-400">{fechaHora(m.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {preview.redactado && (
            <div className="flex items-center gap-2 border-t bg-amber-50 px-4 py-2 text-xs text-amber-800">
              <ShieldAlert className="size-3.5" /> Se ocultarán datos de contacto al enviar.
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); enviar(); }} className="flex items-center gap-2 border-t p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Responder al ticket…" className="h-10 flex-1 rounded-md border border-input bg-secondary/40 px-3 text-sm outline-none focus:bg-card focus:ring-2 focus:ring-ring" />
            <Button type="submit" size="icon" variant="gradient" disabled={sending}>{sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</Button>
          </form>
        </Card>
      ) : (
        <Card><CardContent className="flex h-[600px] items-center justify-center text-ink-500">Selecciona un ticket</CardContent></Card>
      )}
    </div>
  );
}
