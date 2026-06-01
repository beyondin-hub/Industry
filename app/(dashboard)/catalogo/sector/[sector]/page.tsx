import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, ClipboardCheck, Zap, BookOpen, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { SectorCatalog } from "@/components/sector/sector-catalog";
import {
  fetchSector,
  fetchSectorCategories,
  fetchSectorProducts,
  fetchSectorGuides,
} from "@/lib/repos/sectors";
import { SECTOR_SLUGS } from "@/lib/sector/context";

export async function generateMetadata({ params }: { params: { sector: string } }) {
  const sector = await fetchSector(params.sector);
  return { title: sector ? `${sector.nombre_brand} · Catálogo` : "Catálogo" };
}

export default async function SectorCatalogPage({
  params,
  searchParams,
}: {
  params: { sector: string };
  searchParams: { category?: string; q?: string };
}) {
  if (!SECTOR_SLUGS.includes(params.sector as (typeof SECTOR_SLUGS)[number])) notFound();
  const sector = await fetchSector(params.sector);
  if (!sector) notFound();

  const [categories, products, guides] = await Promise.all([
    fetchSectorCategories(sector.slug),
    fetchSectorProducts(sector.slug),
    fetchSectorGuides(sector.slug),
  ]);

  const color = sector.color_primario;
  const isMed = sector.slug === "medical";
  const kit = isMed
    ? { href: "/herramientas/auditoria", label: "Kit de Auditoría", icon: ClipboardCheck }
    : { href: "/herramientas/linea-smt", label: "Kit de Línea SMT", icon: Zap };

  return (
    <div className="space-y-6">
      {/* Hero del sector */}
      <div
        className="rounded-2xl border-l-[3px] p-5"
        style={{ borderLeftColor: color, backgroundColor: `${color}14` }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-lg font-bold" style={{ color }}>
              <span className="text-2xl">{sector.icono}</span> {sector.nombre_brand}
            </p>
            <h1 className="mt-1 text-xl font-semibold text-ink-900">
              Catálogo para {sector.nombre}
            </h1>
            <p className="mt-1 text-sm text-ink-600">
              {isMed
                ? "Todos los productos verificados con certificación ISO 13485 · FDA · USP · ISO 11607"
                : "Productos ESD-safe · RoHS · ANSI S20.20 · IPC"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/cotizar?sector=${sector.slug}`} className={buttonVariants({ variant: "accent" })}>
              <Plus className="size-4" /> Nueva Cotización
            </Link>
            <Link href={kit.href}>
              <Button variant="outline" style={{ borderColor: `${color}55`, color }}>
                <kit.icon className="size-4" /> {kit.label}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Catálogo */}
      <SectorCatalog
        sector={sector}
        categories={categories}
        products={products}
        initialCategory={searchParams.category}
        initialQ={searchParams.q}
      />

      {/* Guías técnicas del sector */}
      {guides.length > 0 && (
        <section className="rounded-2xl border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink-900">
              <BookOpen className="size-4" style={{ color }} /> Guías técnicas de {sector.nombre_brand}
            </h2>
            <Link
              href={`/guias/${sector.slug}`}
              className="flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color }}
            >
              Ver todas <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {guides.slice(0, 3).map((g) => (
              <Link
                key={g.id}
                href={`/guias/${sector.slug}/${g.slug}`}
                className="rounded-xl border p-4 transition-colors hover:border-ink-300"
              >
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                  style={{ color, backgroundColor: `${color}14` }}
                >
                  {g.categoria}
                </span>
                <p className="mt-2 font-medium leading-snug text-ink-900">{g.titulo}</p>
                <p className="mt-1 text-xs text-ink-500">{g.resumen}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
