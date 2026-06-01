import { cookies } from "next/headers";
import { getContext } from "@/lib/repos/context";
import { createClient } from "@/lib/supabase/server";
import { getSector } from "@/lib/data/sectors";
import type { IndustrySector } from "@/types";

/** Cookie que persiste el sector elegido en modo demo (sin DB/sesión). */
export const SECTOR_COOKIE = "novak_sector";

export const SECTOR_SLUGS = ["medical", "electronics"] as const;

export interface SectorState {
  /** Sector activo del comprador, o null si aún no lo configuró. */
  sector: IndustrySector | null;
  /** true si el comprador ya pasó por el onboarding de sector. */
  configured: boolean;
}

/**
 * Resuelve el sector activo del comprador.
 * - Live: lee buyers.sector_id / sector_configurado.
 * - Demo: lee la cookie `novak_sector`.
 * La presentación (colores, beneficios) siempre viene del catálogo de
 * sectores demo, que es la fuente única para los 2 sectores del MVP.
 */
export async function getActiveSector(): Promise<SectorState> {
  const ctx = await getContext();

  // Modo live: el sector vive en la fila del comprador.
  if (!ctx.isDemo) {
    const buyer = ctx.buyer as unknown as Record<string, unknown>;
    const sectorId = (buyer.sector_id as string | null) ?? null;
    const configured = Boolean(buyer.sector_configurado);
    if (sectorId) {
      const supabase = createClient();
      try {
        const { data } = await supabase!
          .from("industry_sectors")
          .select("slug")
          .eq("id", sectorId)
          .single();
        if (data?.slug) {
          return { sector: getSector(data.slug) ?? null, configured };
        }
      } catch {
        /* cae a cookie abajo */
      }
    }
    // Sin sector en DB todavía: respeta la cookie si existe.
    const slug = cookies().get(SECTOR_COOKIE)?.value;
    return { sector: slug ? getSector(slug) ?? null : null, configured: configured || Boolean(slug) };
  }

  // Modo demo: cookie.
  const slug = cookies().get(SECTOR_COOKIE)?.value;
  const sector = slug ? getSector(slug) ?? null : null;
  return { sector, configured: Boolean(sector) };
}
