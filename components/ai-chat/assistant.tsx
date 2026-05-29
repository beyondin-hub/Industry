"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const SUGERENCIAS = [
  "Necesito 50 baleros 6205 urgentes",
  "¿Qué guante recomiendas para ensamble?",
  "Cotiza grasa EP2 a crédito 60 días",
];

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente de compras MROLink 🔧 Dime qué insumo necesitas, pega un número de parte o describe tu problema de planta y te ayudo a cotizarlo en minutos.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Tuve un problema de conexión. Puedes escribirnos por WhatsApp y un especialista te atiende al instante.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-steel-900 px-5 py-3.5 font-semibold text-white shadow-lg transition-transform hover:scale-105"
        >
          <Sparkles className="size-5 text-safety" />
          Asistente MRO
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[min(92vw,400px)] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-steel-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-safety">
                <Bot className="size-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Asistente MROLink</p>
                <p className="text-[11px] text-steel-400">Especialista en insumos industriales</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar">
              <X className="size-5 text-steel-400 hover:text-white" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-steel-50 p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                    m.role === "user"
                      ? "rounded-br-sm bg-steel-900 text-white"
                      : "rounded-bl-sm border bg-white text-steel-800",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border bg-white px-3.5 py-2.5">
                  <span className="flex gap-1">
                    <span className="size-2 animate-pulse-dot rounded-full bg-steel-400" />
                    <span className="size-2 animate-pulse-dot rounded-full bg-steel-400 [animation-delay:200ms]" />
                    <span className="size-2 animate-pulse-dot rounded-full bg-steel-400 [animation-delay:400ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 border-t bg-white px-3 py-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border bg-steel-50 px-2.5 py-1 text-xs text-steel-700 hover:border-safety hover:text-safety"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu necesidad…"
              className="h-10 flex-1 rounded-md border border-input bg-steel-50 px-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="icon" variant="accent" disabled={loading}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
