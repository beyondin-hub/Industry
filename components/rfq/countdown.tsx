"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/** Cuenta regresiva en vivo hacia la fecha límite de cotización (garantía 2h). */
export function Countdown({ deadline }: { deadline: string }) {
  const target = new Date(deadline).getTime();
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const hh = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
  const mm = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
  const ss = String(Math.floor((diff % 60_000) / 1000)).padStart(2, "0");
  const vencido = diff <= 0;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm font-medium text-ink-300">
        <Clock className="size-4 animate-pulse-dot" />
        {vencido ? "Cumpliendo tu garantía…" : "Tu cotización llegará en"}
      </span>
      <div className="flex items-center gap-2 font-mono">
        {[hh, mm, ss].map((seg, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-2xl text-ink-500">:</span>}
            <span className="min-w-[3.2rem] rounded-xl bg-white/5 px-3 py-2 text-center text-3xl font-extrabold text-gradient ring-1 ring-white/10 sm:text-4xl">
              {seg}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
