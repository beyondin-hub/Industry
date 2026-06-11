import { PRODUCTS } from "@/lib/data/products";
import { getProvider } from "@/lib/data/providers";

export type MovimientoTipo = "entrada" | "salida" | "reserva" | "liberacion" | "ajuste";

export interface InventoryItem {
  id: string;
  product_id: string;
  provider_id: string;
  sku: string;
  nombre: string;
  proveedor: string;
  ubicacion: string;
  stock: number;
  reservado: number;
  disponible: number;
  stock_minimo: number;
  costo_unitario: number;
  bajo_minimo: boolean;
}

export interface Movement {
  id: string;
  inventory_id: string;
  sku: string;
  nombre: string;
  tipo: MovimientoTipo;
  cantidad: number;
  saldo: number;
  referencia: string;
  usuario: string;
  created_at: string;
}

function bin(i: number): string {
  const rack = String.fromCharCode(65 + (i % 5)); // A–E
  return `${rack}-${String(1 + (i % 12)).padStart(2, "0")}-${1 + (i % 4)}`;
}

// Demo: el hub consolida los SKUs con stock confirmado (fulfillment_tj).
export const INVENTORY: InventoryItem[] = PRODUCTS.filter((p) => p.stock_actual > 0)
  .slice(0, 14)
  .map((p, i) => {
    const reservado = Math.round(p.stock_actual * (0.05 + (i % 4) * 0.04));
    const stock = Math.round(p.stock_actual * 0.6); // porción consignada en el hub
    const prov = getProvider(p.provider_id);
    return {
      id: `wh-${p.id}`,
      product_id: p.id,
      provider_id: p.provider_id,
      sku: p.numero_parte,
      nombre: p.nombre,
      proveedor: prov?.nombre_comercial ?? "Proveedor",
      ubicacion: bin(i),
      stock,
      reservado,
      disponible: Math.max(0, stock - reservado),
      stock_minimo: p.stock_minimo,
      costo_unitario: p.precio_minimo,
      bajo_minimo: stock - reservado <= p.stock_minimo,
    };
  });

const TIPOS: MovimientoTipo[] = ["entrada", "salida", "reserva", "ajuste", "liberacion"];

// Bitácora demo: últimos movimientos sobre el inventario.
export const MOVEMENTS: Movement[] = INVENTORY.slice(0, 10).map((it, i) => {
  const tipo = TIPOS[i % TIPOS.length];
  const cantidad = 5 + ((i * 7) % 40);
  return {
    id: `mov-${i}`,
    inventory_id: it.id,
    sku: it.sku,
    nombre: it.nombre,
    tipo,
    cantidad,
    saldo: it.stock,
    referencia: tipo === "salida" || tipo === "reserva" ? `OC-2026-0${280 + i}` : "Recibo proveedor",
    usuario: "Equipo Novak",
    created_at: new Date(Date.now() - i * 7 * 36e5).toISOString(),
  };
});
