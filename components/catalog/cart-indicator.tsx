"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { useCatalogStore } from "@/lib/catalog/store";

/** Indicador del carrito de cotización en el topbar. */
export function CartIndicator() {
  const { cart } = useCatalogStore();
  const count = cart.reduce((n, l) => n + 1, 0);

  return (
    <Link
      href="/cotizacion"
      className="relative flex size-9 items-center justify-center rounded-md hover:bg-secondary"
      aria-label="Mi cotización"
      title="Mi cotización"
    >
      <ClipboardList className="size-5 text-steel-700" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-safety text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
