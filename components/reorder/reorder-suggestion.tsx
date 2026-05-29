"use client";

import { useState } from "react";
import { Sparkles, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { num } from "@/lib/utils";

interface Suggestion {
  producto: string;
  cantidad: number;
  unidad: string;
  frecuencia: number; // días sugeridos por patrón
  descuento: number;
}

// Sugerencias derivadas del patrón de compra (demo).
const SUGERENCIAS: Suggestion[] = [
  { producto: "Aceite hidráulico ISO 46 (cubeta 19L)", cantidad: 4, unidad: "cubeta", frecuencia: 45, descuento: 5 },
  { producto: "Disco de corte para metal 4-1/2\"", cantidad: 20, unidad: "paquete", frecuencia: 30, descuento: 5 },
];

export function ReorderSuggestion() {
  const { toast } = useToast();
  const [activadas, setActivadas] = useState<string[]>([]);

  return (
    <div className="rounded-xl border border-safety/30 bg-safety-50/40 p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Sparkles className="size-4 text-safety" /> Novak detectó patrones de compra recurrentes
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {SUGERENCIAS.map((s) => {
          const on = activadas.includes(s.producto);
          return (
            <div key={s.producto} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">{s.producto}</p>
                <p className="flex items-center gap-1.5 text-xs text-ink-500">
                  <Clock className="size-3" /> Cada ~{s.frecuencia} días · {num(s.cantidad)} {s.unidad}
                  <Badge variant="success" className="text-[10px]">−{s.descuento}%</Badge>
                </p>
              </div>
              {on ? (
                <Badge variant="success"><Check className="size-3" /> Activado</Badge>
              ) : (
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => {
                    setActivadas((a) => [...a, s.producto]);
                    toast({ type: "success", title: "Reorden activado", description: `${s.producto} cada ${s.frecuencia} días con ${s.descuento}% de descuento.` });
                  }}
                >
                  Activar 1-clic
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
