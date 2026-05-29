import Stripe from "stripe";

/**
 * Cliente de Stripe para cobro de membresías de proveedores.
 * Devuelve null si no hay clave configurada (modo demo).
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

// Planes de membresía de proveedor (precios de referencia MXN/mes).
export const PLANES_PROVEEDOR = {
  basico: { nombre: "Básico", precio: 2500, productos: 50 },
  premium: { nombre: "Premium", precio: 5000, productos: 300 },
  enterprise: { nombre: "Enterprise", precio: 8000, productos: Infinity },
} as const;
