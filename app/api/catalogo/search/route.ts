import { NextResponse } from "next/server";
import { fetchProducts } from "@/lib/repos/products";
import { CATEGORIAS } from "@/lib/constants";
import { priceForQty } from "@/lib/catalog/signals";
import type { CategoriaMRO, Product } from "@/types";

export const runtime = "nodejs";

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Detecta un número de parte explícito en el query (con guiones/dígitos). */
function looksLikePartNumber(q: string) {
  return /[a-z]*\d{2,}/i.test(q.replace(/\s/g, ""));
}

function slim(p: Product) {
  return {
    id: p.id,
    nombre: p.nombre,
    numero_parte: p.numero_parte,
    marca: p.marca,
    categoria: p.categoria,
    unidad: p.unidad,
    precio_base: p.precio_base,
    stock_actual: p.stock_actual,
    tiempo_entrega_horas: p.tiempo_entrega_horas,
    imagen_url: p.imagen_url,
    price_tiers: p.price_tiers,
  };
}

/**
 * Búsqueda del catálogo.
 * - ?suggest=1 → dropdown (exacto + sugeridos + categorías).
 * - normal → resultados paginados con filtros (server-side).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const suggest = url.searchParams.get("suggest") === "1";
  const categoria = (url.searchParams.get("categoria") as CategoriaMRO | null) ?? undefined;

  if (!q && suggest) return NextResponse.json({ exact: null, products: [], categories: [] });

  let list = await fetchProducts({ q: q || undefined, categoria });
  const nq = norm(q);

  // Coincidencia exacta por número de parte.
  const exact =
    q && looksLikePartNumber(q)
      ? list.find((p) => norm(p.numero_parte) === nq) ??
        list.find((p) => norm(p.numero_parte).replace(/[-\s]/g, "") === nq.replace(/[-\s]/g, ""))
      : undefined;

  if (suggest) {
    const cats = CATEGORIAS.filter((c) => norm(c.nombre).includes(nq) || nq.includes(c.slug))
      .slice(0, 3)
      .map((c) => ({
        slug: c.slug,
        nombre: c.nombre,
        emoji: c.emoji,
        total: list.filter((p) => p.categoria === c.slug).length,
      }));
    const products = list.filter((p) => p.id !== exact?.id).slice(0, 5).map(slim);
    return NextResponse.json({
      exact: exact ? slim(exact) : null,
      products,
      categories: cats,
      total: list.length,
    });
  }

  // Búsqueda completa con filtros server-side.
  const marca = url.searchParams.get("marca");
  const disp = url.searchParams.get("disponibilidad");
  const precioMin = Number(url.searchParams.get("precio_min") ?? 0) || 0;
  const precioMax = Number(url.searchParams.get("precio_max") ?? 0) || 0;
  const sort = url.searchParams.get("sort") ?? "relevancia";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(60, Math.max(1, Number(url.searchParams.get("limit") ?? 24) || 24));

  if (marca) list = list.filter((p) => norm(p.marca) === norm(marca));
  if (disp === "stock_tj") list = list.filter((p) => p.stock_actual > 0);
  if (precioMin) list = list.filter((p) => p.precio_base >= precioMin);
  if (precioMax) list = list.filter((p) => p.precio_base <= precioMax);

  if (sort === "precio_asc") list.sort((a, b) => a.precio_base - b.precio_base);
  else if (sort === "precio_desc") list.sort((a, b) => b.precio_base - a.precio_base);
  else if (sort === "entrega") list.sort((a, b) => a.tiempo_entrega_horas - b.tiempo_entrega_horas);
  else if (sort === "stock") list.sort((a, b) => b.stock_actual - a.stock_actual);

  const total = list.length;
  const products = list.slice((page - 1) * limit, page * limit).map((p) => ({
    ...slim(p),
    // precio de ejemplo a 100 pzas (server-side) para el SERP
    precio_100: priceForQty(p, 100).precio,
  }));

  return NextResponse.json({ products, total, page, limit, exact: exact ? slim(exact) : null });
}
