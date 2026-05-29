"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, TrendingDown, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { mxn, cn } from "@/lib/utils";

// Multiplicador de costo oculto por industria (calidad, retrabajos, penalizaciones).
const INDUSTRIA_MULT: Record<string, { label: string; mult: number }> = {
  automotriz: { label: "Automotriz (IATF)", mult: 1.35 },
  electronica: { label: "Electrónica", mult: 1.2 },
  medico: { label: "Dispositivos médicos", mult: 1.5 },
  aeroespacial: { label: "Aeroespacial", mult: 1.6 },
  plasticos: { label: "Plásticos / Inyección", mult: 1.15 },
  metalmecanica: { label: "Metalmecánica", mult: 1.1 },
};

const HORAS_TURNO: Record<string, number> = { "1": 8, "2": 16, "3": 24 };

export function DowntimeCalculator() {
  const [industria, setIndustria] = useState("automotriz");
  const [turnos, setTurnos] = useState("3");
  const [valorHora, setValorHora] = useState(45000);

  const mult = INDUSTRIA_MULT[industria]?.mult ?? 1.2;
  const costoHora = valorHora * mult;
  const horasDia = HORAS_TURNO[turnos] ?? 24;
  const riesgo3Dias = costoHora * horasDia * 3; // cotización tardada típica
  const conMrolink = costoHora * 2; // respuesta en 2h
  const reduccion = Math.round((1 - conMrolink / riesgo3Dias) * 100);

  return (
    <div className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm md:grid-cols-2 md:p-8">
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-ink-950 text-safety">
            <Calculator className="size-5" />
          </span>
          <h3 className="font-display text-xl font-bold text-ink-950">
            Calculadora de costo de paro
          </h3>
        </div>
        <div>
          <Label className="mb-1.5 block">Industria</Label>
          <Select value={industria} onChange={(e) => setIndustria(e.target.value)}>
            {Object.entries(INDUSTRIA_MULT).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Turnos por día</Label>
          <Select value={turnos} onChange={(e) => setTurnos(e.target.value)}>
            <option value="1">1 turno (8h)</option>
            <option value="2">2 turnos (16h)</option>
            <option value="3">3 turnos (24h)</option>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Valor de producción por hora (MXN)</Label>
          <Input
            type="number"
            min={0}
            step={1000}
            value={valorHora}
            onChange={(e) => setValorHora(Math.max(0, Number(e.target.value) || 0))}
            className="font-mono"
          />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-xl bg-ink-950 p-6 text-white glow-accent">
        <div>
          <p className="text-sm text-ink-300">Cada hora de paro de línea te cuesta</p>
          <p className="font-display text-4xl font-extrabold text-gradient">{mxn(costoHora)}</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-ink-300">Cotización tardada (3 días)</span>
            <span className="font-mono font-semibold text-danger">{mxn(riesgo3Dias)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-300">Con MROLink (respuesta 2h)</span>
            <span className="font-mono font-semibold text-emerald-400">{mxn(conMrolink)}</span>
          </div>
        </div>
        <div className="rounded-lg bg-white/5 p-3 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-400">
            <TrendingDown className="size-4" /> Reduces ese riesgo hasta {reduccion}%
          </p>
        </div>
        <Link
          href="/cotizar"
          className={cn(buttonVariants({ variant: "gradient", size: "lg" }), "w-full")}
        >
          Evita ese costo — Cotiza gratis <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
