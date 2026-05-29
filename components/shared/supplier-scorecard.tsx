import { Star, ShieldCheck, Truck, Package, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Provider } from "@/types";

// Sub-scores derivados de forma determinista del score general (demo, estilo Alibaba Trade Assurance).
function subScores(score: number) {
  const base = score; // 0-5
  return {
    calidad: Math.min(5, base + 0.1),
    velocidad: Math.max(3, base - 0.2),
    comunicacion: Math.min(5, base),
    precio: Math.max(3, base - 0.4),
  };
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between text-[11px] text-ink-500">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div className="h-full gradient-accent" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
    </div>
  );
}

export function SupplierScorecard({ provider }: { provider: Provider }) {
  const s = subScores(provider.score);
  // Métricas demo determinísticas.
  const ordenes = Math.round(provider.score * 73);
  const entregaProm = provider.stock_confirmado ? 26 : 52;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-ink-950 font-display text-sm font-bold text-white">
                {provider.nombre_comercial.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold leading-tight text-ink-900">{provider.nombre_comercial}</p>
                <p className="flex items-center gap-1 text-xs text-ink-500">
                  <MapPin className="size-3" /> {provider.ciudad}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-ink-950 px-2.5 py-1 text-white">
            <Star className="size-3.5 fill-gold text-gold" />
            <span className="font-mono text-sm font-bold">{provider.score.toFixed(1)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Bar label="Calidad" value={s.calidad} />
          <Bar label="Velocidad" value={s.velocidad} />
          <Bar label="Comunicación" value={s.comunicacion} />
          <Bar label="Precio" value={s.precio} />
        </div>

        <div className="flex flex-wrap gap-1">
          {provider.certificaciones.map((c) => (
            <Badge key={c} variant="steel" className="text-[10px]">
              <ShieldCheck className="size-2.5" /> {c}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-3 text-xs text-ink-500">
          <span className="flex items-center gap-1">
            <Package className="size-3.5" /> {ordenes} órdenes
          </span>
          <span className="flex items-center gap-1">
            <Truck className="size-3.5" /> entrega prom. {entregaProm}h
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
