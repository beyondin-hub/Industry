import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { IndustrySector, SectorCategory } from "@/types";

/**
 * Banner de identidad sectorial que encabeza el dashboard del comprador.
 * Borde y fondo teñidos con el color del sector; chips de categoría
 * clickeables que llevan al catálogo sectorial filtrado.
 */
export function SectorBanner({
  sector,
  categories,
}: {
  sector: IndustrySector;
  categories: SectorCategory[];
}) {
  const color = sector.color_primario;
  return (
    <div
      className="rounded-xl border-l-[3px] p-4"
      style={{ borderLeftColor: color, backgroundColor: `${color}14` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {sector.icono}
          </span>
          <div>
            <p className="text-base font-bold" style={{ color }}>
              {sector.nombre_brand}
            </p>
            <p className="text-sm text-steel-600">{sector.tagline}</p>
          </div>
        </div>
        <Link
          href="/onboarding/sector"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-steel-500 hover:text-steel-800"
        >
          Cambiar sector <ExternalLink className="size-3" />
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {categories
          .filter((c) => c.destacada)
          .map((c) => (
            <Link
              key={c.slug}
              href={`/catalogo/sector/${sector.slug}?category=${c.slug}`}
              className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-steel-700 transition-colors hover:text-white"
              style={{ borderColor: `${color}55` }}
            >
              {c.icono} {c.nombre}
            </Link>
          ))}
      </div>
    </div>
  );
}
