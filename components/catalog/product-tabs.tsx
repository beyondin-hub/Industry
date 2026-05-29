"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, ShieldCheck, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoriaNombre, categoriaEmoji } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const TABS = ["Especificaciones", "Certificaciones", "Documentos", "Reseñas"] as const;
type Tab = (typeof TABS)[number];

// Reseñas demo verificadas.
const REVIEWS = [
  { autor: "Compras · Automotriz Tijuana", rating: 5, texto: "Llegó al día siguiente, calidad de fábrica. Cero paros desde que compramos aquí.", fecha: "Abr 2026" },
  { autor: "Mantenimiento · Electrónica Mexicali", rating: 5, texto: "Cumple la norma que necesitábamos para auditoría IATF. Buen precio por volumen.", fecha: "Mar 2026" },
  { autor: "Jefe de planta · Cd. Juárez", rating: 4, texto: "Producto correcto. El crédito a 60 días ayudó al flujo del mes.", fecha: "Feb 2026" },
];

export function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<Tab>("Especificaciones");

  return (
    <div className="rounded-xl border bg-card">
      {/* Tab headers */}
      <div className="flex overflow-x-auto border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative whitespace-nowrap px-5 py-3 text-sm font-medium transition-colors",
              tab === t ? "text-ink-950" : "text-ink-500 hover:text-ink-800",
            )}
          >
            {t}
            {tab === t && (
              <motion.span layoutId="tab-underline" className="absolute inset-x-3 -bottom-px h-0.5 gradient-accent" />
            )}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "Especificaciones" && (
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(product.especificaciones).map(([k, v], i) => (
                <tr key={k} className={i % 2 ? "bg-secondary/40" : ""}>
                  <td className="w-1/2 px-3 py-2.5 font-medium text-ink-600">{k}</td>
                  <td className="px-3 py-2.5 font-mono text-ink-900">{v}</td>
                </tr>
              ))}
              <tr className="bg-secondary/40">
                <td className="px-3 py-2.5 font-medium text-ink-600">Categoría</td>
                <td className="px-3 py-2.5 text-ink-900">
                  {categoriaEmoji(product.categoria)} {categoriaNombre(product.categoria)} · {product.subcategoria}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-medium text-ink-600">Unidad de venta</td>
                <td className="px-3 py-2.5 text-ink-900">{product.unidad}</td>
              </tr>
            </tbody>
          </table>
        )}

        {tab === "Certificaciones" && (
          <div className="space-y-3">
            {product.certificaciones.length === 0 && (
              <p className="text-sm text-ink-500">Sin certificaciones registradas.</p>
            )}
            {product.certificaciones.map((c) => (
              <div key={c} className="flex items-center justify-between rounded-lg border p-3">
                <span className="flex items-center gap-2 font-medium text-ink-900">
                  <ShieldCheck className="size-4 text-emerald-600" /> {c}
                </span>
                <Badge variant="success">Vigente · exp. 2027</Badge>
              </div>
            ))}
          </div>
        )}

        {tab === "Documentos" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="justify-start">
              <FileText className="size-4" /> Ficha técnica (PDF) <Download className="ml-auto size-4" />
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="size-4" /> Plano / CAD (.dwg) <Download className="ml-auto size-4" />
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="size-4" /> Hoja de seguridad (SDS) <Download className="ml-auto size-4" />
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="size-4" /> Certificado de calidad <Download className="ml-auto size-4" />
            </Button>
          </div>
        )}

        {tab === "Reseñas" && (
          <div className="space-y-3">
            {REVIEWS.map((r, i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={cn("size-3.5", j < r.rating ? "fill-gold text-gold" : "text-ink-200")} />
                    ))}
                  </div>
                  <Badge variant="steel" className="text-[10px]"><CheckCircle2 className="size-2.5" /> Compra verificada</Badge>
                </div>
                <p className="mt-2 text-sm text-ink-700">“{r.texto}”</p>
                <p className="mt-1.5 text-xs text-ink-400">{r.autor} · {r.fecha}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
