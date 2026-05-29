import Link from "next/link";
import { Truck, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/catalog/product-image";
import { mxn, entregaLabel } from "@/lib/utils";
import { getProvider } from "@/lib/data/providers";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const prov = getProvider(product.provider_id);
  const enStock = product.stock_actual > 0;
  const ahorro =
    product.precio_base > product.precio_minimo
      ? Math.round((1 - product.precio_minimo / product.precio_base) * 100)
      : 0;

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <Link href={`/catalogo/${product.id}`} className="block">
        <div className="h-36 overflow-hidden rounded-t-xl border-b">
          <ProductImage categoria={product.categoria} numeroParte={product.numero_parte} marca={product.marca} imagenUrl={product.imagen_url} />
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-steel-500">
          <span className="font-semibold text-safety">{product.marca}</span>
          <span>·</span>
          <span className="font-mono">{product.numero_parte}</span>
        </div>
        <Link href={`/catalogo/${product.id}`}>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-steel-900 hover:text-safety">
            {product.nombre}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap gap-1">
          {product.certificaciones.slice(0, 2).map((c) => (
            <Badge key={c} variant="steel" className="text-[10px]">
              <ShieldCheck className="size-2.5" /> {c}
            </Badge>
          ))}
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-steel-950">{mxn(product.precio_base)}</p>
            <p className="text-xs text-steel-500">/{product.unidad}</p>
          </div>
          {ahorro > 0 && (
            <Badge variant="accent" className="text-[10px]">−{ahorro}% por volumen</Badge>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {enStock ? (
            <Badge variant="success" className="text-[10px]">
              <Truck className="size-2.5" /> {entregaLabel(product.tiempo_entrega_horas, prov?.ciudad)}
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[10px]">Sobre pedido</Badge>
          )}
        </div>

        <div className="mt-3 flex gap-2 border-t pt-3">
          <Link href={`/catalogo/${product.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Ver detalle
            </Button>
          </Link>
          <Link href={`/cotizar?sku=${product.id}`} className="flex-1">
            <Button variant="accent" size="sm" className="w-full">
              Cotizar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
