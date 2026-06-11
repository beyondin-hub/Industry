import { NextResponse } from "next/server";
import { fetchSector, fetchSectorCategories } from "@/lib/repos/sectors";

export const runtime = "nodejs";

/** Categorías de un sector. */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const sector = await fetchSector(params.slug);
  if (!sector) {
    return NextResponse.json({ error: "Sector no encontrado." }, { status: 404 });
  }
  const categories = await fetchSectorCategories(params.slug);
  return NextResponse.json({ categories });
}
