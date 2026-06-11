import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Markdown } from "@/components/sector/markdown";
import { fetchSector, fetchSectorGuide } from "@/lib/repos/sectors";
import { SECTOR_SLUGS } from "@/lib/sector/context";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const guide = await fetchSectorGuide(params.slug);
  return { title: guide ? guide.titulo : "Guía" };
}

export default async function GuideDetailPage({
  params,
}: {
  params: { sector: string; slug: string };
}) {
  if (!SECTOR_SLUGS.includes(params.sector as (typeof SECTOR_SLUGS)[number])) notFound();
  const [sector, guide] = await Promise.all([
    fetchSector(params.sector),
    fetchSectorGuide(params.slug),
  ]);
  if (!sector || !guide || guide.sector_slug !== sector.slug) notFound();
  const color = sector.color_primario;

  return (
    <article className="mx-auto max-w-3xl space-y-5">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
        <Link href={`/guias/${sector.slug}`} className="hover:underline" style={{ color }}>
          Guías {sector.nombre_brand}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-ink-700">{guide.titulo}</span>
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-ink-900">{guide.titulo}</h1>
        <p className="mt-2 text-sm text-ink-600">{guide.resumen}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {guide.tags.map((t) => (
            <span
              key={t}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ color, backgroundColor: `${color}14` }}
            >
              {t}
            </span>
          ))}
        </div>
      </header>

      <div className="rounded-2xl border bg-card p-6">
        {guide.contenido ? (
          <Markdown content={guide.contenido} />
        ) : (
          <p className="text-sm text-ink-600">{guide.resumen}</p>
        )}
      </div>

      <Link
        href={`/catalogo/sector/${sector.slug}`}
        className={buttonVariants({ variant: "accent" })}
      >
        Ver catálogo {sector.nombre_brand} <ArrowRight className="size-4" />
      </Link>
    </article>
  );
}
