import { createClient } from "@/lib/supabase/server";
import { INVENTORY, MOVEMENTS, type InventoryItem, type Movement } from "@/lib/data/warehouse";

export async function fetchInventory(providerId?: string): Promise<InventoryItem[]> {
  const supabase = createClient();
  if (!supabase) {
    return providerId ? INVENTORY.filter((i) => i.provider_id === providerId) : INVENTORY;
  }
  try {
    let query = supabase.from("warehouse_inventory").select("*, providers(nombre_comercial)").order("sku");
    if (providerId) query = query.eq("provider_id", providerId);
    const { data, error } = await query.limit(500);
    if (error || !data || data.length === 0) {
      return providerId ? INVENTORY.filter((i) => i.provider_id === providerId) : INVENTORY;
    }
    return data.map((d: any) => {
      const disponible = Math.max(0, (d.stock ?? 0) - (d.reservado ?? 0));
      return {
        id: d.id,
        product_id: d.product_id,
        provider_id: d.provider_id,
        sku: d.sku ?? "",
        nombre: d.nombre ?? "",
        proveedor: d.providers?.nombre_comercial ?? "—",
        ubicacion: d.ubicacion ?? "—",
        stock: d.stock ?? 0,
        reservado: d.reservado ?? 0,
        disponible,
        stock_minimo: d.stock_minimo ?? 0,
        costo_unitario: d.costo_unitario ?? 0,
        bajo_minimo: disponible <= (d.stock_minimo ?? 0),
      };
    });
  } catch {
    return providerId ? INVENTORY.filter((i) => i.provider_id === providerId) : INVENTORY;
  }
}

export async function fetchMovements(): Promise<Movement[]> {
  const supabase = createClient();
  if (!supabase) return MOVEMENTS;
  try {
    const { data, error } = await supabase
      .from("warehouse_movements")
      .select("*, warehouse_inventory(sku, nombre)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error || !data || data.length === 0) return MOVEMENTS;
    return data.map((d: any) => ({
      id: d.id,
      inventory_id: d.inventory_id,
      sku: d.warehouse_inventory?.sku ?? "",
      nombre: d.warehouse_inventory?.nombre ?? "",
      tipo: d.tipo,
      cantidad: d.cantidad,
      saldo: d.saldo ?? 0,
      referencia: d.referencia ?? "",
      usuario: d.usuario ?? "Equipo Novak",
      created_at: d.created_at,
    }));
  } catch {
    return MOVEMENTS;
  }
}
