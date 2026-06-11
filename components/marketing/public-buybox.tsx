import Link from "next/link";
import { Truck, AlertTriangle, MessageCircle, UserPlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { mxn, num } from "@/lib/utils";
import { stockStatus, deliveryETA, socialProof } from "@/lib/catalog/signals";
import type { Product } from "@/types";

const STOCK_VARIANT = {
  success: "success",
  warning: "warning",
  danger: "danger",
  muted: "secondary",
} as const;

/** Panel de compra público (sin carrito): precio, volumen, stock y CTA a registro. */
export function PublicBuyBox({ product }: { product: Product }) {
  const stock = stockStatus(product);
  const proof = socialProof(product);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-ink-950">{mxn(product.precio_base)}</span>
        <span className="text-sm text-steel-500">/{product.unidad}</span>
      </div>
      <p className="mt-0.5 text-xs text-steel-500">Precio público · + IVA · CFDI garantizado</p>

      {/* Disponibilidad + ETA */}
      <div className="mt-4 space-y-1.5">
        <Badge variant={STOCK_VARIANT[stock.tone]} className="text-[11px]">
          {stock.escaso ? <AlertTriangle className="size-3" /> : null} {stock.label}
        </Badge>
        <p className="flex items-center gap-1.5 text-xs text-steel-600">
          <Truck className="size-3.5 shrink-0" /> {deliveryETA(product)}
        </p>
        {proof && <p className="text-xs font-medium text-safety">{proof}</p>}
      </div>

      {/* Precios por volumen */}
      {product.price_tiers.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-steel-700">Precios por volumen</p>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-steel-50 text-left text-xs text-steel-500">
                  <th className="px-3 py-2 font-medium">Cantidad</th>
                  <th className="px-3 py-2 text-right font-medium">Precio unitario</th>
                </tr>
              </thead>
              <tbody>
                {product.price_tiers.map((t) => (
                  <tr key={t.cantidad_minima} className="border-t">
                    <td className="px-3 py-2">{num(t.cantidad_minima)}+</td>
                    <td className="px-3 py-2 text-right font-semibold">{mxn(t.precio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CTA a registro */}
      <div className="mt-5 space-y-2">
        <Link href="/registro" className={cn(buttonVariants({ variant: "accent", size: "lg" }), "w-full")}>
          <UserPlus className="size-4" /> Crear cuenta para cotizar
        </Link>
        <a
          href={BRAND.whatsappLink}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full text-emerald-700")}
        >
          <MessageCircle className="size-4" /> Cotizar por WhatsApp
        </a>
      </div>
      <p className="mt-3 text-center text-xs text-steel-500">
        Con tu cuenta: agrega a cotización, compra a crédito 30/60/90 y recibe CFDI automático.
      </p>
    </div>
  );
}
