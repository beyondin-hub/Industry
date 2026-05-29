"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bot, Send, X, Sparkles, Truck, FileSpreadsheet, Eraser } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mxn, entregaLabel, cn } from "@/lib/utils";

interface ProductCard {
  id: string; nombre: string; numero_parte: string; marca: string;
  precio_base: number; unidad: string; tiempo_entrega_horas: number; stock_actual: number;
}
interface UiMessage {
  role: "user" | "assistant";
  content: string;
  products?: ProductCard[];
  suggestRFQ?: boolean;
}

const CHIPS = [
  "Buscar por número de parte",
  "Validar certificación IATF",
  "Calcular mi RFQ",
  "Estado de mi orden",
];

const WELCOME: UiMessage = {
  role: "assistant",
  content:
    "¡Hey! Soy Novak 👋 Tu equipo de compras industrial. Dime qué insumo necesitas, pégame un número de parte o describe tu problema de planta — yo busco en catálogo y te armo el RFQ.",
};

const STORAGE_KEY = "novak_chat";

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([WELCOME]);
  const endRef = useRef<HTMLDivElement>(null);

  // Cargar historial de sessionStorage.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);
  // Persistir.
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
  }, [messages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: UiMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply, products: data.products, suggestRFQ: data.suggestRFQ }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Tuve un problema de conexión. Escríbenos por WhatsApp y te atendemos al instante." }]);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([WELCOME]);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-ink-950 px-5 py-3.5 font-semibold text-white shadow-lg transition-transform hover:scale-105"
        >
          <Sparkles className="size-5 text-safety" />
          Hey Novak
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[min(94vw,420px)] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl">
          <div className="flex items-center justify-between bg-ink-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full gradient-accent">
                <Bot className="size-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Novak</p>
                <p className="text-[11px] text-ink-400">Tu equipo de compras industrial</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={reset} aria-label="Limpiar" title="Nueva conversación" className="text-ink-400 hover:text-white"><Eraser className="size-4" /></button>
              <button onClick={() => setOpen(false)} aria-label="Cerrar"><X className="size-5 text-ink-400 hover:text-white" /></button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-secondary/40 p-4">
            {messages.map((m, i) => (
              <div key={i}>
                <div className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                    m.role === "user" ? "rounded-br-sm bg-ink-950 text-white" : "rounded-bl-sm border bg-card text-ink-800",
                  )}>
                    {m.content}
                  </div>
                </div>

                {/* Tarjetas de producto en vivo */}
                {m.products && m.products.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.products.map((p) => (
                      <div key={p.id} className="rounded-xl border bg-card p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink-900">{p.nombre}</p>
                            <p className="font-mono text-[11px] text-ink-400">{p.marca} · {p.numero_parte}</p>
                          </div>
                          <span className="shrink-0 text-sm font-bold text-ink-950">{mxn(p.precio_base)}</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          {p.stock_actual > 0 ? (
                            <Badge variant="success" className="text-[10px]"><Truck className="size-2.5" /> {entregaLabel(p.tiempo_entrega_horas)}</Badge>
                          ) : (
                            <Badge variant="warning" className="text-[10px]">Sobre pedido</Badge>
                          )}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Link href={`/catalogo/${p.id}`} onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}>Ver</Link>
                          <Link href={`/cotizar?sku=${p.id}`} onClick={() => setOpen(false)} className={cn(buttonVariants({ variant: "gradient", size: "sm" }), "flex-1")}>Cotizar</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sugerencia de armar RFQ */}
                {m.suggestRFQ && (
                  <div className="mt-2 flex justify-start">
                    <Link
                      href={m.products?.[0] ? `/cotizar?sku=${m.products[0].id}` : "/cotizar"}
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants({ variant: "gradient", size: "sm" }))}
                    >
                      <FileSpreadsheet className="size-3.5" /> Armar RFQ con esto (cotización en 2h)
                    </Link>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border bg-card px-3.5 py-2.5">
                  <span className="flex gap-1">
                    <span className="size-2 animate-pulse-dot rounded-full bg-ink-400" />
                    <span className="size-2 animate-pulse-dot rounded-full bg-ink-400 [animation-delay:200ms]" />
                    <span className="size-2 animate-pulse-dot rounded-full bg-ink-400 [animation-delay:400ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t bg-card px-3 py-2">
              {CHIPS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border bg-secondary/50 px-2.5 py-1 text-xs text-ink-700 hover:border-safety hover:text-safety">
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t bg-card p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu necesidad…"
              className="h-10 flex-1 rounded-md border border-input bg-secondary/40 px-3 text-sm outline-none focus:bg-card focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="icon" variant="gradient" disabled={loading}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
