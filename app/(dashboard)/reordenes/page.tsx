import { Repeat, Calendar, Percent, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AUTO_REORDERS } from "@/lib/data/account";
import { getProduct } from "@/lib/data/products";
import { mxn, num, fechaCorta } from "@/lib/utils";

export const metadata = { title: "Reorden automático" };

export default function ReordenesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reorden automático"
        description="Suscríbete a tus insumos recurrentes y ahorra 5% (estilo Subscribe & Save B2B)"
      >
        <Button variant="accent"><Plus className="size-4" /> Nueva suscripción</Button>
      </PageHeader>

      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <Percent className="size-8 text-emerald-600" />
          <div>
            <p className="font-semibold text-steel-900">Ahorra automáticamente cada mes</p>
            <p className="text-sm text-steel-600">
              Programa la frecuencia y MROLink genera el RFQ por ti antes de que te quedes sin stock.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AUTO_REORDERS.map((ar) => {
          const p = getProduct(ar.product_id);
          if (!p) return null;
          const precioConDesc = p.precio_base * (1 - ar.descuento_pct / 100);
          return (
            <Card key={ar.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between">
                  <Repeat className="size-7 text-safety" />
                  <Badge variant={ar.activo ? "success" : "secondary"}>
                    {ar.activo ? "Activa" : "Pausada"}
                  </Badge>
                </div>
                <h3 className="font-semibold text-steel-900">{p.nombre}</h3>
                <div className="space-y-1.5 text-sm text-steel-600">
                  <p className="flex items-center justify-between">
                    <span>Cantidad</span>
                    <span className="font-medium text-steel-900">{num(ar.cantidad)} {p.unidad}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Calendar className="size-3.5" /> Frecuencia</span>
                    <span className="font-medium text-steel-900">cada {ar.frecuencia_dias} días</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Precio c/desc.</span>
                    <span className="font-medium text-emerald-600">
                      {mxn(precioConDesc)} <span className="text-xs">(−{ar.descuento_pct}%)</span>
                    </span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span>Próxima orden</span>
                    <span className="font-medium text-steel-900">{fechaCorta(ar.proxima_fecha)}</span>
                  </p>
                </div>
                <div className="flex gap-2 border-t pt-3">
                  <Button variant="outline" size="sm" className="flex-1">Editar</Button>
                  <Button variant="ghost" size="sm" className="flex-1">Pausar</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
