"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatalogStore } from "@/lib/catalog/store";

/** Botón "Agregar a cotización" de un clic (carruseles, recompra). */
export function QuickAddButton({
  id,
  cantidad = 1,
  label = "Agregar a cotización",
}: {
  id: string;
  cantidad?: number;
  label?: string;
}) {
  const { addToCart } = useCatalogStore();
  const [done, setDone] = useState(false);
  return (
    <Button
      variant={done ? "outline" : "accent"}
      size="sm"
      className="w-full"
      onClick={() => {
        addToCart(id, cantidad);
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
    >
      {done ? <><Check className="size-3.5" /> Agregado</> : <><Plus className="size-3.5" /> {label}</>}
    </Button>
  );
}
