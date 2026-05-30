import { createClient } from "@/lib/supabase/server";
import { PROVIDERS, PENDING_APPLICATIONS, getProvider as getDemoProvider } from "@/lib/data/providers";
import type { Provider } from "@/types";

function mapProvider(row: any): Provider {
  return {
    id: row.id,
    razon_social: row.razon_social,
    rfc: row.rfc,
    nombre_comercial: row.nombre_comercial ?? row.razon_social,
    ciudad: row.ciudad,
    categorias: row.categorias ?? [],
    certificaciones: row.certificaciones ?? [],
    score: Number(row.score ?? 0),
    stock_confirmado: row.stock_confirmado ?? false,
    credito_disponible: row.credito_disponible ?? 0,
    activo: row.activo ?? true,
    plan_membresia: row.plan_membresia ?? "basico",
    estado: row.estado ?? "aprobado",
    es_fundador: row.es_fundador ?? false,
    created_at: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchProvider(id: string): Promise<Provider | undefined> {
  const supabase = createClient();
  if (!supabase) return getDemoProvider(id);
  try {
    const { data, error } = await supabase.from("providers").select("*").eq("id", id).single();
    if (error || !data) return getDemoProvider(id);
    return mapProvider(data);
  } catch {
    return getDemoProvider(id);
  }
}

export async function fetchProviders(): Promise<Provider[]> {
  const supabase = createClient();
  if (!supabase) return PROVIDERS;
  try {
    const { data, error } = await supabase.from("providers").select("*").eq("activo", true);
    if (error || !data || data.length === 0) return PROVIDERS;
    return data.map(mapProvider);
  } catch {
    return PROVIDERS;
  }
}

/** Solicitudes de proveedor pendientes de aprobación (bandeja admin). */
export async function fetchPendingProviders(): Promise<Provider[]> {
  const supabase = createClient();
  if (!supabase) return PENDING_APPLICATIONS;
  try {
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .eq("estado", "pendiente")
      .order("created_at", { ascending: true });
    if (error || !data) return PENDING_APPLICATIONS;
    return data.map(mapProvider);
  } catch {
    return PENDING_APPLICATIONS;
  }
}
