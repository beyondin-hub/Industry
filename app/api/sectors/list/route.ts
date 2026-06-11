import { NextResponse } from "next/server";
import { fetchSectors } from "@/lib/repos/sectors";

export const runtime = "nodejs";

/** Lista los sectores industriales activos. */
export async function GET() {
  const sectors = await fetchSectors();
  return NextResponse.json({
    sectors: sectors.map((s) => ({
      id: s.id,
      slug: s.slug,
      nombre: s.nombre,
      nombre_brand: s.nombre_brand,
      tagline: s.tagline,
      color_primario: s.color_primario,
      color_secundario: s.color_secundario,
      icono: s.icono,
      industrias_ejemplo: s.industrias_ejemplo ?? [],
      beneficios: s.beneficios ?? [],
      orden: s.orden,
    })),
  });
}
