"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { mxn } from "@/lib/utils";

export function SpendChart({ data }: { data: readonly { mes: string; total: number }[] }) {
  const last = data.length - 1;
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={[...data]} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D4AFF" />
              <stop offset="100%" stopColor="#9B5CFF" />
            </linearGradient>
          </defs>
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6B6056" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tick={{ fontSize: 11, fill: "#6B6056" }} axisLine={false} tickLine={false} width={42} />
          <Tooltip
            cursor={{ fill: "#0D0C0A08" }}
            formatter={(value: any) => mxn(Number(value))}
            contentStyle={{ borderRadius: 12, border: "1px solid #D4CFC5", fontSize: 12, background: "#FBFAF7" }}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === last ? "url(#barGrad)" : "#D9D2C6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
