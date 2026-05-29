"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { mxn } from "@/lib/utils";

const MESES = ["Dic", "Ene", "Feb", "Mar", "Abr", "May"];

/** Genera 6 meses de historial determinista alrededor del precio base. */
function build(base: number, seedId: string) {
  let seed = seedId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return MESES.map((mes, i) => {
    const drift = (rand() - 0.45) * 0.12; // ±~6%
    const trend = 1 + (i - MESES.length) * 0.006; // leve baja histórica
    return { mes, precio: Math.round(base * trend * (1 + drift)) };
  });
}

export function PriceHistoryChart({ base, id }: { base: number; id: string }) {
  const data = build(base, id);
  const min = Math.min(...data.map((d) => d.precio));
  const max = Math.max(...data.map((d) => d.precio));

  return (
    <div>
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6D4AFF" />
                <stop offset="100%" stopColor="#E0529C" />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6B6056" }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[min * 0.95, max * 1.05]} />
            <Tooltip
              formatter={(value: any) => mxn(Number(value))}
              labelFormatter={(l) => `Mes: ${l}`}
              contentStyle={{ borderRadius: 12, border: "1px solid #D4CFC5", fontSize: 12, background: "#FBFAF7" }}
            />
            <Line type="monotone" dataKey="precio" stroke="url(#lineGrad)" strokeWidth={3} dot={{ r: 3, fill: "#6D4AFF" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-center text-[11px] text-ink-400">
        Historial de precio · últimos 6 meses
      </p>
    </div>
  );
}
