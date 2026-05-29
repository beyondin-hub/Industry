"use server";

import { createClient } from "@/lib/supabase/server";
import { getProviderContext } from "@/lib/repos/provider-context";

export interface DraftProduct {
  nombre: string;
  numero_parte?: string;
  marca?: string;
  categoria: string;
  unidad?: string;
  precio: number;
  descripcion?: string;
  certificaciones?: string[];
}

export interface PublishResult {
  ok: boolean;
  publicados: number;
  persisted: boolean;
  error?: string;
}

/**
 * Publica productos del proveedor. Persiste en `products` con el provider_id
 * de la sesión cuando hay Supabase; en demo devuelve el conteo.
 */
export async function publishProducts(drafts: DraftProduct[]): Promise<PublishResult> {
  const validos = (drafts ?? []).filter((d) => d.nombre?.trim().length > 2 && d.precio > 0);
  if (validos.length === 0) {
    return { ok: false, publicados: 0, persisted: false, error: "Agrega nombre y precio a tus productos." };
  }

  const supabase = createClient();
  const ctx = await getProviderContext();

  if (!supabase || ctx.isDemo) {
    return { ok: true, publicados: validos.length, persisted: false };
  }

  try {
    const rows = validos.map((d) => ({
      provider_id: ctx.provider.id,
      nombre: d.nombre,
      numero_parte: d.numero_parte || null,
      marca: d.marca || null,
      categoria: d.categoria,
      unidad: d.unidad || "pza",
      precio_base: d.precio,
      precio_minimo: d.precio,
      descripcion: d.descripcion || null,
      certificaciones: d.certificaciones ?? [],
      activo: true,
      publicado: true,
      creado_por: ctx.userId,
    }));
    const { error } = await supabase.from("products").insert(rows);
    if (error) return { ok: false, publicados: 0, persisted: false, error: error.message };
    return { ok: true, publicados: validos.length, persisted: true };
  } catch {
    return { ok: false, publicados: 0, persisted: false, error: "No se pudieron publicar los productos." };
  }
}
