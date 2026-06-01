"use client";

import Image from "next/image";
import { useState } from "react";
import { categoriaEmoji } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { photoForProduct } from "@/lib/catalog/images";
import type { CategoriaMRO } from "@/types";

// Gradiente sutil por categoría — fallback si no hay foto o falla la carga.
const GRAD: Record<string, string> = {
  rodamientos: "from-ink-100 to-steel-200",
  epp: "from-amber-50 to-amber-100",
  lubricantes: "from-purplecow-50 to-purplecow-100",
  herramientas: "from-steel-100 to-ink-100",
  neumatica: "from-sky-50 to-sky-100",
  electrico: "from-emerald-50 to-emerald-100",
  abrasivos: "from-ink-100 to-ink-200",
  sujetadores: "from-stone-100 to-stone-200",
  sellos: "from-rose-50 to-rose-100",
  filtros: "from-teal-50 to-teal-100",
};

export function ProductImage({
  categoria,
  numeroParte,
  marca,
  imagenUrl,
  className,
  size = "card",
}: {
  categoria: CategoriaMRO;
  numeroParte?: string;
  marca?: string;
  imagenUrl?: string;
  className?: string;
  size?: "card" | "detail";
}) {
  const [failed, setFailed] = useState(false);
  const src = failed ? undefined : photoForProduct(categoria, imagenUrl);

  // Foto real (propia o por categoría) con next/image; cae al placeholder si falla.
  if (src) {
    return (
      <div className={cn("relative h-full w-full overflow-hidden bg-steel-50", className)}>
        <Image
          src={src}
          alt={`${marca ? `${marca} ` : ""}${numeroParte ?? "Producto industrial"}`}
          fill
          sizes={size === "detail" ? "(max-width: 768px) 100vw, 640px" : "(max-width: 768px) 50vw, 320px"}
          className="object-cover"
          onError={() => setFailed(true)}
        />
        {numeroParte && (
          <span className="absolute bottom-2 left-2 rounded bg-card/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-600 backdrop-blur">
            {marca ? `${marca} · ` : ""}{numeroParte}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br", GRAD[categoria] ?? "from-ink-100 to-steel-200", className)}>
      <div className="absolute inset-0 bg-grid opacity-30" />
      <span className={cn("relative", size === "detail" ? "text-7xl" : "text-5xl")}>{categoriaEmoji(categoria)}</span>
      {numeroParte && (
        <span className="absolute bottom-2 left-2 rounded bg-card/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-600 backdrop-blur">
          {marca ? `${marca} · ` : ""}{numeroParte}
        </span>
      )}
    </div>
  );
}
