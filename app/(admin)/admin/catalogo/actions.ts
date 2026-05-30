"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

/** Modera un producto: activa/desactiva la publicación en el catálogo. */
export async function setProductActive(input: { productId: string; nombre: string; activo: boolean }): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    await logAudit({ accion: input.activo ? "product.activate" : "product.deactivate", entidad: "product", entidad_id: input.nombre });
    return { ok: true };
  }
  try {
    const { error } = await supabase
      .from("products")
      .update({ activo: input.activo, publicado: input.activo })
      .eq("id", input.productId);
    if (error) return { ok: false, error: error.message };
    await logAudit({ accion: input.activo ? "product.activate" : "product.deactivate", entidad: "product", entidad_id: input.nombre });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo moderar el producto." };
  }
}
