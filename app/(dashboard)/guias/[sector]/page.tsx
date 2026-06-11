import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock } from "lucide-react";
import { fetchSector, fetchSectorGuides } from "@/lib/repos/sectors";
import { SECTOR_SLUGS } from "@/lib/sector/context";

const CAT_LABEL: Record<string, string> = {
  "seleccion-producto": "Selección de producto",
  normativa: "Normativa",
  proceso: "Proceso",
  faq: "FAQ",
};

export async function generateMetadata({ params }: { params: { sector: string } }) {
  const sector = await fetchSector(params.sector);
  return { title: sector ? `Guías · ${sector.nombre_brand}` : "Guías" };
}

export default async function SectorGuidesPage({ params }: { params: { sector: string } }) {
  if (!SECTOR_SLUGS.includes(params.sector as (typeof SECTOR_SLUGS)[number])) notFound();
  const sector = await fetchSector(params.sector);
  if (!sector) notFound();
  const guides = await fetchSectorGuides(sector.slug);
  const color = sector.color_primario;

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border-l-[3px] p-5"
        style={{ borderLeftColor: color, backgroundColor: `${color}14` }}
      >
        <h1 className="flex items-center gap-2 text-xl font-bold" style={{ color }}>
          <BookOpen className="size-5" /> Guías técnicas · {sector.nombre_brand}
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Selección de producto, normativa y proceso para tu industria.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <Link
            key={g.id}
            href={`/guias/${sector.slug}/${g.slug}`}
            className="flex flex-col rounded-xl border bg-card p-5 transition-colors hover:border-ink-300"
          >
            <span
              className="inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
              style={{ color, backgroundColor: `${color}14` }}
            >
              {CAT_LABEL[g.categoria] ?? g.categoria}
            </span>
            <p className="mt-2 font-semibold leading-snug text-ink-900">{g.titulo}</p>
            <p className="mt-1 flex-1 text-sm text-ink-500">{g.resumen}</p>
            <p className="mt-3 flex items-center gap-1 text-xs text-ink-400">
              <Clock className="size-3" /> 3 min de lectura
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
