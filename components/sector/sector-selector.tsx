"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IndustrySector } from "@/types";

export function SectorSelector({ sectors }: { sectors: IndustrySector[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function choose(slug: string) {
    if (pending || done) return;
    setPending(slug);
    try {
      await fetch("/api/buyer/sector", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector_slug: slug }),
      });
      setDone(true);
      // Pequeña pausa para la confirmación, luego al dashboard.
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);
    } catch {
      setPending(null);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
          <Check className="h-7 w-7 text-emerald-400" />
        </div>
        <p className="text-lg font-semibold text-white">Tu experiencia está lista</p>
        <p className="text-sm text-paper-100/60">Llevándote a tu panel…</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid gap-5 sm:grid-cols-2">
        {sectors.map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => choose(s.slug)}
            disabled={Boolean(pending)}
            style={{ ["--sc" as string]: s.color_primario }}
            className={cn(
              "group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all duration-300",
              "hover:-translate-y-1 hover:border-[var(--sc)] hover:bg-white/[0.06] hover:shadow-2xl",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sc)]",
              pending && pending !== s.slug && "opacity-40",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${s.color_primario}22` }}
              >
                {s.icono}
              </span>
              <div>
                <p className="text-lg font-bold text-white">{s.nombre_brand}</p>
                <p className="text-xs text-paper-100/60">{s.nombre}</p>
              </div>
            </div>

            <ul className="mt-5 space-y-2">
              {(s.beneficios ?? []).map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-paper-100/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: s.color_primario }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {s.industrias_ejemplo && s.industrias_ejemplo.length > 0 && (
              <p className="mt-5 text-xs text-paper-100/40">
                Industrias: {s.industrias_ejemplo.join(", ")}
              </p>
            )}

            <span
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: s.color_primario }}
            >
              {pending === s.slug ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Configurando…
                </>
              ) : (
                <>
                  Seleccionar {s.nombre_brand} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={() => choose("general")}
          disabled={Boolean(pending)}
          className="text-sm text-paper-100/50 underline-offset-4 transition-colors hover:text-paper-100/80 hover:underline disabled:opacity-40"
        >
          Mi empresa es de manufactura general → Ver catálogo completo sin filtro de sector
        </button>
      </div>
    </div>
  );
}
