import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con service-role key — SOLO para uso en servidor (Route Handlers,
 * Server Actions). Omite RLS, así que nunca debe exponerse al navegador.
 * Se usa para flujos de alta de empresa/comprador durante el registro.
 * Devuelve `null` si no está configurado (modo demo).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
