import { createClient } from "@/lib/supabase/server";
import {
  PRODUCTS,
  getProduct as getDemoProduct,
  searchProducts as searchDemoProducts,
} from "@/lib/data/products";
import type { CategoriaMRO, Product } from "@/types";

/** Mapea una fila de Supabase (con price_tiers anidados) al tipo Product. */
function mapProduct(row: any): Product {
  return {
    id: row.id,
    provider_id: row.provider_id,
    nombre: row.nombre,
    numero_parte: row.numero_parte ?? "",
    marca: row.marca ?? "",
    categoria: row.categoria,
    subcategoria: row.subcategoria ?? "",
    descripcion: row.descripcion ?? "",
    especificaciones: row.especificaciones ?? {},
    certificaciones: row.certificaciones ?? [],
    precio_base: Number(row.precio_base ?? 0),
    precio_minimo: Number(row.precio_minimo ?? 0),
    unidad: row.unidad ?? "pza",
    stock_actual: row.stock_actual ?? 0,
    stock_minimo: row.stock_minimo ?? 0,
    tiempo_entrega_horas: row.tiempo_entrega_horas ?? 48,
    imagen_url: row.imagen_url ?? undefined,
    ficha_tecnica_url: row.ficha_tecnica_url ?? undefined,
    cad_url: row.cad_url ?? undefined,
    activo: row.activo ?? true,
    price_tiers: (row.price_tiers ?? [])
      .map((t: any) => ({ cantidad_minima: t.cantidad_minima, precio: Number(t.precio) }))
      .sort((a: any, b: any) => a.cantidad_minima - b.cantidad_minima),
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

const SELECT = "*, price_tiers(cantidad_minima, precio)";

export async function fetchProducts(opts?: {
  q?: string;
  categoria?: CategoriaMRO;
}): Promise<Product[]> {
  const supabase = createClient();

  if (!supabase) {
    let list = opts?.q ? searchDemoProducts(opts.q) : PRODUCTS;
    if (opts?.categoria) list = list.filter((p) => p.categoria === opts.categoria);
    return list;
  }

  try {
    let query = supabase.from("products").select(SELECT).eq("activo", true);
    if (opts?.categoria) query = query.eq("categoria", opts.categoria);
    if (opts?.q) {
      const q = opts.q.replace(/[%,]/g, " ");
      query = query.or(
        `nombre.ilike.%${q}%,numero_parte.ilike.%${q}%,marca.ilike.%${q}%,descripcion.ilike.%${q}%`,
      );
    }
    const { data, error } = await query.limit(200);
    if (error || !data) throw error;
    return data.map(mapProduct);
  } catch {
    let list = opts?.q ? searchDemoProducts(opts.q) : PRODUCTS;
    if (opts?.categoria) list = list.filter((p) => p.categoria === opts.categoria);
    return list;
  }
}

export async function fetchProduct(id: string): Promise<Product | undefined> {
  const supabase = createClient();
  if (!supabase) return getDemoProduct(id);

  try {
    const { data, error } = await supabase
      .from("products")
      .select(SELECT)
      .eq("id", id)
      .single();
    if (error || !data) return getDemoProduct(id);
    return mapProduct(data);
  } catch {
    return getDemoProduct(id);
  }
}

export async function fetchRelated(
  categoria: CategoriaMRO,
  excludeId: string,
  limit = 3,
): Promise<Product[]> {
  const all = await fetchProducts({ categoria });
  return all.filter((p) => p.id !== excludeId).slice(0, limit);
}
