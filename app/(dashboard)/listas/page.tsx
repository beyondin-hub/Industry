import Link from "next/link";
import { Star, ListChecks, ShoppingCart, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SHOPPING_LISTS } from "@/lib/data/account";
import { getProduct } from "@/lib/data/products";
import { mxn, num } from "@/lib/utils";

export const metadata = { title: "Mis listas" };

export default function ListasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis listas de compra"
        description="Plantillas reutilizables para resurtidos recurrentes (estilo Grainger Lists)"
      >
        <Button variant="accent"><Plus className="size-4" /> Nueva lista</Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        {SHOPPING_LISTS.map((list) => {
          const items = list.items
            .map((i) => ({ product: getProduct(i.product_id), cantidad: i.cantidad }))
            .filter((i) => i.product);
          const total = items.reduce(
            (s, i) => s + (i.product!.precio_base * i.cantidad),
            0,
          );
          return (
            <Card key={list.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {list.es_favorita ? (
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                  ) : (
                    <ListChecks className="size-4 text-steel-500" />
                  )}
                  {list.nombre}
                </CardTitle>
                <Badge variant="secondary">{items.length} productos</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="divide-y rounded-lg border">
                  {items.map((i) => (
                    <div key={i.product!.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-steel-900">{i.product!.nombre}</p>
                        <p className="text-xs text-steel-500">
                          {num(i.cantidad)} {i.product!.unidad} × {mxn(i.product!.precio_base)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-steel-900">
                        {mxn(i.product!.precio_base * i.cantidad)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-steel-600">Total estimado</span>
                  <span className="text-lg font-bold text-steel-950">{mxn(total)}</span>
                </div>
                <Link
                  href="/cotizar"
                  className={buttonVariants({ variant: "accent", className: "w-full" })}
                >
                  <ShoppingCart className="size-4" /> Cotizar lista completa
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
