"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import type { PlatformConfig } from "@/lib/data/admin";

export async function savePlatformConfig(config: PlatformConfig): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (supabase) {
    try {
      await supabase.from("platform_config").upsert({ clave: "main", valor: config as any, updated_at: new Date().toISOString() });
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "No se pudo guardar." };
    }
  }
  await logAudit({ accion: "config.save", entidad: "platform", entidad_id: "main", detalle: "Actualizó configuración de plataforma" });
  return { ok: true };
}
