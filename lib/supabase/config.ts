// Server-safe: ¿hay Supabase configurado? Si no, la app corre en modo demo
// (sin sesión real), y mostramos utilidades de demostración para explorar roles.
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
