import { NextResponse } from "next/server";
import { fetchSector, fetchSectorGuides } from "@/lib/repos/sectors";

export const runtime = "nodejs";

/** Guías técnicas de un sector. */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const sector = await fetchSector(params.slug);
  if (!sector) {
    return NextResponse.json({ error: "Sector no encontrado." }, { status: 404 });
  }
  const guides = await fetchSectorGuides(params.slug);
  return NextResponse.json({ guides });
}
