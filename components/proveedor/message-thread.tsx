"use client";

import { useState } from "react";
import { Send, ShieldAlert, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redactContact } from "@/lib/anti-bypass";
import { fechaHora, cn } from "@/lib/utils";

interface Msg {
  id: string;
  remitente: "novak" | "proveedor" | "comprador";
  cuerpo: string;
  redactado?: boolean;
  created_at: string;
}

const SEED: Msg[] = [
  { id: "m1", remitente: "novak", cuerpo: "Hola RodaNorte 👋 Tienes un RFQ asignado (MRO-2026-0148): 50 baleros 6205-2RS, entrega Tijuana. ¿Puedes cotizar hoy?", created_at: new Date(Date.now() - 3600_000).toISOString() },
  { id: "m2", remitente: "proveedor", cuerpo: "Sí, tenemos stock. Cotizo $158/pza a 50 piezas. Entrega mañana.", created_at: new Date(Date.now() - 3000_000).toISOString() },
  { id: "m3", remitente: "novak", cuerpo: "Perfecto. Recuerda: la comunicación y el cierre van por Novak; nosotros facturamos y cobramos a la maquila.", created_at: new Date(Date.now() - 2400_000).toISOString() },
];

export function MessageThread({ rfqFolio = "MRO-2026-0148" }: { rfqFolio?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Vista previa de redacción en vivo mientras el proveedor escribe.
  const preview = redactContact(input);

  async function send() {
    const cuerpo = input.trim();
    if (!cuerpo || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfq_id: rfqFolio, cuerpo, remitente: "proveedor" }),
      });
      const data = await res.json();
      setMsgs((m) => [...m, { id: data.id, remitente: "proveedor", cuerpo: data.cuerpo, redactado: data.redactado, created_at: data.created_at }]);
      setInput("");
    } catch {
      /* noop */
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="font-display text-sm font-semibold text-ink-900">Mensajes · {rfqFolio}</p>
          <p className="flex items-center gap-1 text-[11px] text-ink-500"><Lock className="size-3" /> Mediado por Novak · comprador protegido</p>
        </div>
        <Badge variant="steel" className="text-[10px]"><ShieldAlert className="size-2.5" /> Sin datos de contacto</Badge>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-secondary/30 p-4">
        {msgs.map((m) => {
          const mine = m.remitente === "proveedor";
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm", mine ? "rounded-br-sm bg-ink-950 text-white" : "rounded-bl-sm border bg-card text-ink-800")}>
                {!mine && (
                  <p className={cn("mb-0.5 text-[10px] font-semibold uppercase tracking-wide", m.remitente === "novak" ? "text-safety" : "text-ink-400")}>
                    {m.remitente === "novak" ? "Novak (operaciones)" : "Comprador verificado"}
                  </p>
                )}
                <p>{m.cuerpo}</p>
                {m.redactado && <p className="mt-1 text-[10px] text-amber-400">Se ocultaron datos de contacto por política Novak</p>}
                <p className={cn("mt-1 text-[10px]", mine ? "text-ink-400" : "text-ink-400")}>{fechaHora(m.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vista previa de redacción en vivo */}
      {preview.redactado && (
        <div className="flex items-center gap-2 border-t bg-amber-50 px-4 py-2 text-xs text-amber-800">
          <ShieldAlert className="size-3.5 shrink-0" />
          Detectamos datos de contacto. Se enviarán como: <span className="font-mono">{preview.limpio.slice(0, 60)}…</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 border-t p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje… (los teléfonos/emails se ocultan automáticamente)"
          className="h-10 flex-1 rounded-md border border-input bg-secondary/40 px-3 text-sm outline-none focus:bg-card focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" size="icon" variant="gradient" disabled={sending}>
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
