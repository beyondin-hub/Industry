"use client";

import { useEffect } from "react";
import { useCatalogStore } from "@/lib/catalog/store";

/** Registra la vista del producto al montar el PDP. No renderiza nada. */
export function RecentlyViewedTracker({ id }: { id: string }) {
  const { trackView } = useCatalogStore();
  useEffect(() => {
    trackView(id);
  }, [id, trackView]);
  return null;
}
