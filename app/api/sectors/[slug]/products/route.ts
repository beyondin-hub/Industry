import { NextResponse } from "next/server";
import { fetchSector, fetchSectorProducts } from "@/lib/repos/sectors";

export const runtime = "nodejs";

/**
 * Productos de un sector con filtros.
 * Query params: category, q, badges (coma-separados),
 * disponibilidad ('stock_tj'|'stock_nacional'|'todos'), page, limit.
 */
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const sector = await fetchSector(params.slug);
  if (!sector) {
    return NextResponse.json({ error: "Sector no encontrado." }, { status: 404 });
  }

  const url = new URL(req.url);
  const category = url.searchParams.get("category") ?? undefined;
  const q = url.searchParams.get("q") ?? undefined;
  const badgesParam = url.searchParams.get("badges");
  const badges = badgesParam ? badgesParam.split(",").map((b) => b.trim()).filter(Boolean) : undefined;
  const disponibilidad = (url.searchParams.get("disponibilidad") as
    | "stock_tj"
    | "stock_nacional"
    | "todos"
    | null) ?? undefined;

  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(60, Math.max(1, Number(url.searchParams.get("limit") ?? 24) || 24));

  const all = await fetchSectorProducts(params.slug, { category, q, badges, disponibilidad });
  const total = all.length;
  const start = (page - 1) * limit;
  const products = all.slice(start, start + limit);

  return NextResponse.json({ products, total, page, limit });
}
