import Link from "next/link";
import { CheckCircle2, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mxn } from "@/lib/utils";
import type { SectorProduct } from "@/types";

/**
 * Tarjeta de producto con contexto sectorial: badges de certificación del
 * sector activo, uso específico y 2-3 atributos técnicos clave.
 */
export function ProductCardSector({
  product,
  color,
}: {
  product: SectorProduct;
  color: string;
}) {
  const specs = Object.entries(product.atributos_tecnicos).slice(0, 3);
  const href = `/catalogo/sector/${product.sector_slug}/producto/${product.id}`;

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-4 transition-shadow hover:shadow-md">
      {/* Badges de sector */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {product.badges.slice(0, 3).map((b) => (
          <span
            key={b}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ color, backgroundColor: `${color}14` }}
          >
            {b}
          </span>
        ))}
      </div>

      <Link href={href} className="group">
        <p className="font-semibold leading-snug text-ink-900 group-hover:underline">
          {product.nombre}
        </p>
      </Link>
      <p className="mt-0.5 text-xs text-ink-500">
        {product.sku}
        {product.marca ? ` · ${product.marca}` : ""} · {product.unidad}
      </p>

      <p className="mt-2 text-xs text-ink-600">{product.uso_sector}</p>

      {/* Atributos técnicos clave */}
      <dl className="mt-3 space-y-0.5 rounded-lg bg-steel-50 p-2.5 text-[11px]">
        {specs.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <dt className="text-ink-500">{k}</dt>
            <dd className="font-medium text-ink-800">{v}</dd>
          </div>
        ))}
      </dl>

      {/* Disponibilidad */}
      <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600">
        {product.en_stock_tj ? (
          <>
            <CheckCircle2 className="size-3.5" />
            <MapPin className="size-3" /> En stock · Tijuana
          </>
        ) : (
          "Bajo pedido"
        )}
      </p>

      <div className="mt-auto pt-3">
        <p className="text-lg font-bold text-ink-900">
          {mxn(product.precio)}{" "}
          <span className="text-xs font-normal text-ink-500">/ {product.unidad}</span>
        </p>
        <div className="mt-2 flex gap-2">
          <Link href={`/cotizar?producto=${product.id}`} className="flex-1">
            <Button variant="accent" size="sm" className="w-full">
              Agregar a cotización
            </Button>
          </Link>
          <Link href={href}>
            <Button variant="outline" size="sm" title="Ver detalles técnicos">
              <FileText className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
