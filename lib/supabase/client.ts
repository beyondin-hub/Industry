"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para componentes del navegador.
 * Devuelve `null` si las variables de entorno no están configuradas,
 * lo que permite que el MVP corra con datos de demostración (lib/data).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
