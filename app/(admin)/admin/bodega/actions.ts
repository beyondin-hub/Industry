"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import type { MovimientoTipo } from "@/lib/data/warehouse";

const TIPOS: MovimientoTipo[] = ["entrada", "salida", "reserva", "liberacion", "ajuste"];

/** Registra un movimiento de bodega y ajusta el stock/reservado del SKU. */
export async function registrarMovimiento(input: {
  inventoryId: string;
  sku: string;
  tipo: MovimientoTipo;
  cantidad: number;
  referencia?: string;
}): Promise<{ ok: boolean; saldo?: number; error?: string }> {
  if (!TIPOS.includes(input.tipo)) return { ok: false, error: "Tipo inválido." };
  if (!input.cantidad || input.cantidad <= 0) return { ok: false, error: "Cantidad inválida." };

  const supabase = createClient();
  let saldo: number | undefined;

  if (supabase) {
    try {
      const { data: inv } = await supabase
        .from("warehouse_inventory")
        .select("stock, reservado")
        .eq("id", input.inventoryId)
        .single();
      let stock = inv?.stock ?? 0;
      let reservado = inv?.reservado ?? 0;
      const c = input.cantidad;
      if (input.tipo === "entrada") stock += c;
      else if (input.tipo === "salida") stock = Math.max(0, stock - c);
      else if (input.tipo === "reserva") reservado += c;
      else if (input.tipo === "liberacion") reservado = Math.max(0, reservado - c);
      else if (input.tipo === "ajuste") stock = c;
      saldo = stock;
      await supabase
        .from("warehouse_inventory")
        .update({ stock, reservado, updated_at: new Date().toISOString() })
        .eq("id", input.inventoryId);
      await supabase.from("warehouse_movements").insert({
        inventory_id: input.inventoryId,
        tipo: input.tipo,
        cantidad: c,
        saldo,
        referencia: input.referencia ?? null,
        usuario: "Equipo Novak",
      });
    } catch {
      /* demo */
    }
  }

  await logAudit({
    accion: "bodega.movimiento",
    entidad: "warehouse",
    entidad_id: input.sku,
    detalle: `${input.tipo} ${input.cantidad} (${input.sku})`,
  });
  return { ok: true, saldo };
}
