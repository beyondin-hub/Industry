import { createClient } from "@/lib/supabase/server";
import { PROVIDERS } from "@/lib/data/providers";
import type { Provider } from "@/types";

export interface ProviderContext {
  provider: Provider;
  isDemo: boolean;
  userId: string | null;
}

/**
 * Resuelve el proveedor de la sesión actual (cuenta administradora).
 * Con Supabase + sesión: lee provider_users → providers.
 * Sin sesión/config: usa el proveedor demo (RodaNorte). Resiliente.
 */
export async function getProviderContext(): Promise<ProviderContext> {
  const demo = PROVIDERS[0];
  const supabase = createClient();
  if (!supabase) return { provider: demo, isDemo: true, userId: null };

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { provider: demo, isDemo: true, userId: null };

    const { data: pu } = await supabase
      .from("provider_users")
      .select("provider_id")
      .eq("id", user.id)
      .single();
    if (!pu) return { provider: demo, isDemo: true, userId: user.id };

    const { data: prov } = await supabase
      .from("providers")
      .select("*")
      .eq("id", pu.provider_id)
      .single();
    if (!prov) return { provider: demo, isDemo: true, userId: user.id };

    return { provider: prov as Provider, isDemo: false, userId: user.id };
  } catch {
    return { provider: demo, isDemo: true, userId: null };
  }
}
