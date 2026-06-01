import { cookies } from "next/headers";
import { getContext } from "@/lib/repos/context";
import { createClient } from "@/lib/supabase/server";
import { getSector } from "@/lib/data/sectors";
import type { IndustrySector } from "@/types";

/** Cookie que persiste el sector elegido en modo demo (sin DB/sesión). */
export const SECTOR_COOKIE = "novak_sector";

export const SECTOR_SLUGS = ["medical", "electronics"] as const;

/** Valor de cookie que indica "manufactura general": onboarding hecho, sin sector. */
export const SECTOR_GENERAL = "general";

export interface SectorState {
  /** Sector activo del comprador, o null si eligió general o no configuró. */
  sector: IndustrySector | null;
  /** true si el comprador ya pasó por el onboarding de sector. */
  configured: boolean;
}

/** Interpreta el valor crudo de la cookie de sector. */
function fromCookie(raw: string | undefined): SectorState {
  if (!raw) return { sector: null, configured: false };
  if (raw === SECTOR_GENERAL) return { sector: null, configured: true };
  const sector = getSector(raw) ?? null;
  return { sector, configured: Boolean(sector) };
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
  const cookieState = fromCookie(cookies().get(SECTOR_COOKIE)?.value);

  // Modo live: el sector vive en la fila del comprador.
  if (!ctx.isDemo) {
    const buyer = ctx.buyer as unknown as Record<string, unknown>;
    const sectorId = (buyer.sector_id as string | null) ?? null;
    const configuredDb = Boolean(buyer.sector_configurado);
    if (sectorId) {
      const supabase = createClient();
      try {
        const { data } = await supabase!
          .from("industry_sectors")
          .select("slug")
          .eq("id", sectorId)
          .single();
        if (data?.slug) {
          return { sector: getSector(data.slug) ?? null, configured: configuredDb };
        }
      } catch {
        /* cae a cookie abajo */
      }
    }
    // Sin sector en DB todavía: respeta la cookie.
    return { sector: cookieState.sector, configured: configuredDb || cookieState.configured };
  }

  // Modo demo: cookie.
  return cookieState;
}
