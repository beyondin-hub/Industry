import Link from "next/link";
import { ClipboardCheck, Zap, BookOpen, Target, ChevronRight } from "lucide-react";
import type { IndustrySector, SectorCategory } from "@/types";

/**
 * Bloque "Mi Sector" del sidebar del comprador. Si no hay sector configurado
 * (manufactura general) muestra un CTA para personalizar la experiencia.
 */
export function SidebarSector({
  sector,
  categories,
}: {
  sector: IndustrySector | null;
  categories: SectorCategory[];
}) {
  if (!sector) {
    return (
      <div className="mt-4 border-t border-ink-800 pt-4">
        <Link
          href="/onboarding/sector"
          className="block rounded-lg border border-dashed border-ink-700 px-3 py-3 text-center transition-colors hover:border-safety hover:bg-ink-800/60"
        >
          <span className="flex items-center justify-center gap-2 text-sm font-medium text-white">
            <Target className="size-4" /> Configura tu sector
          </span>
          <span className="mt-0.5 block text-xs text-ink-400">Personaliza tu experiencia</span>
        </Link>
      </div>
    );
  }

  const destacadas = categories.filter((c) => c.destacada);
  const kit =
    sector.slug === "medical"
      ? { href: "/herramientas/auditoria", label: "Kit de Auditoría", icon: ClipboardCheck }
      : { href: "/herramientas/linea-smt", label: "Kit de Línea SMT", icon: Zap };

  return (
    <div className="mt-4 border-t border-ink-800 pt-4">
      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        Mi Sector
      </p>
      <div className="mt-2 flex items-center gap-2 px-3 py-1.5">
        <span style={{ color: sector.color_primario }}>{sector.icono}</span>
        <span className="text-sm font-semibold text-white">{sector.nombre_brand}</span>
      </div>

      <div className="space-y-0.5">
        {destacadas.map((c) => (
          <Link
            key={c.slug}
            href={`/catalogo/${sector.slug}?category=${c.slug}`}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-ink-300 transition-colors hover:bg-ink-800/60 hover:text-white"
          >
            <ChevronRight className="size-3 shrink-0 text-ink-600" />
            <span className="truncate">{c.nombre}</span>
          </Link>
        ))}
        <Link
          href={`/catalogo/${sector.slug}`}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-200 hover:text-white"
          style={{ color: sector.color_secundario }}
        >
          <ChevronRight className="size-3 shrink-0" /> Ver todas →
        </Link>
      </div>

      <div className="mt-2 space-y-0.5 border-t border-ink-800 pt-2">
        <Link
          href={kit.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-300 transition-colors hover:bg-ink-800/60 hover:text-white"
        >
          <kit.icon className="size-4 shrink-0" /> {kit.label}
        </Link>
        <Link
          href={`/guias/${sector.slug}`}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-300 transition-colors hover:bg-ink-800/60 hover:text-white"
        >
          <BookOpen className="size-4 shrink-0" /> Guías Técnicas
        </Link>
      </div>
    </div>
  );
}
