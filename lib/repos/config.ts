import { createClient } from "@/lib/supabase/server";
import { PLATFORM_CONFIG, type PlatformConfig } from "@/lib/data/admin";

export async function fetchPlatformConfig(): Promise<PlatformConfig> {
  const supabase = createClient();
  if (!supabase) return PLATFORM_CONFIG;
  try {
    const { data, error } = await supabase.from("platform_config").select("valor").eq("clave", "main").single();
    if (error || !data?.valor) return PLATFORM_CONFIG;
    return { ...PLATFORM_CONFIG, ...(data.valor as PlatformConfig) };
  } catch {
    return PLATFORM_CONFIG;
  }
}
