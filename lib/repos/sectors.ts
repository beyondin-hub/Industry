import { createClient } from "@/lib/supabase/server";
import {
  SECTORS,
  getSector as getDemoSector,
  categoriesForSector as demoCategories,
  sectorProducts as demoProducts,
  getSectorProduct as getDemoSectorProduct,
  sectorGuides as demoGuides,
} from "@/lib/data/sectors";
import type {
  IndustrySector,
  SectorCategory,
  SectorGuide,
  SectorProduct,
} from "@/types";

// El catálogo sectorial corre primero en modo demo (lib/data/sectors).
// Cuando exista DB con datos en product_sectors, las consultas live
// reemplazan al demo; ante cualquier error o resultado vacío, cae al demo
// para no romper la UI (patrón "conmutable" del resto de repos).

export async function fetchSectors(): Promise<IndustrySector[]> {
  return SECTORS;
}

export async function fetchSector(slug: string): Promise<IndustrySector | undefined> {
  return getDemoSector(slug);
}

export async function fetchSectorCategories(slug: string): Promise<SectorCategory[]> {
  const supabase = createClient();
  if (!supabase) return demoCategories(slug);
  try {
    const { data, error } = await supabase
      .from("sector_categories")
      .select("*, industry_sectors!inner(slug)")
      .eq("industry_sectors.slug", slug)
      .eq("activo", true)
      .order("orden");
    if (error || !data || data.length === 0) return demoCategories(slug);
    return data.map(
      (r: any): SectorCategory => ({
        id: r.id,
        sector_slug: slug as SectorCategory["sector_slug"],
        slug: r.slug,
        nombre: r.nombre,
        descripcion: r.descripcion ?? "",
        icono: r.icono ?? "",
        color_badge: r.color_badge ?? "",
        orden: r.orden ?? 0,
        destacada: r.destacada ?? false,
      }),
    );
  } catch {
    return demoCategories(slug);
  }
}

export interface SectorProductFilter {
  category?: string;
  q?: string;
  badges?: string[];
  disponibilidad?: "stock_tj" | "stock_nacional" | "todos";
}

export async function fetchSectorProducts(
  slug: string,
  filter?: SectorProductFilter,
): Promise<SectorProduct[]> {
  // Demo es la fuente principal del catálogo sectorial por ahora.
  let list = demoProducts(slug);

  if (filter?.category) list = list.filter((p) => p.category_slug === filter.category);
  if (filter?.disponibilidad === "stock_tj") list = list.filter((p) => p.en_stock_tj);
  if (filter?.badges?.length) {
    list = list.filter((p) =>
      filter.badges!.every((b) =>
        p.badges.some((pb) => pb.toLowerCase().includes(b.toLowerCase())),
      ),
    );
  }
  if (filter?.q) {
    const q = filter.q.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.marca ?? "").toLowerCase().includes(q) ||
        p.badges.some((b) => b.toLowerCase().includes(q)) ||
        Object.values(p.atributos_tecnicos).some((v) => v.toLowerCase().includes(q)),
    );
  }

  // Destacados primero.
  return list.sort((a, b) => Number(b.destacado_sector) - Number(a.destacado_sector));
}

export async function fetchSectorProduct(id: string): Promise<SectorProduct | undefined> {
  return getDemoSectorProduct(id);
}

export async function fetchRelatedSectorProducts(
  slug: string,
  categorySlug: string,
  excludeId: string,
  limit = 4,
): Promise<SectorProduct[]> {
  return demoProducts(slug)
    .filter((p) => p.category_slug === categorySlug && p.id !== excludeId)
    .slice(0, limit);
}

export async function fetchSectorGuides(slug: string): Promise<SectorGuide[]> {
  const supabase = createClient();
  if (!supabase) return demoGuides(slug);
  try {
    const { data, error } = await supabase
      .from("sector_guides")
      .select("*, industry_sectors!inner(slug)")
      .eq("industry_sectors.slug", slug)
      .eq("activo", true)
      .order("orden");
    if (error || !data || data.length === 0) return demoGuides(slug);
    return data.map(
      (r: any): SectorGuide => ({
        id: r.id,
        sector_slug: slug as SectorGuide["sector_slug"],
        titulo: r.titulo,
        slug: r.slug,
        resumen: r.resumen ?? "",
        contenido: r.contenido ?? undefined,
        categoria: r.categoria ?? "proceso",
        tags: r.tags ?? [],
        orden: r.orden ?? 0,
      }),
    );
  } catch {
    return demoGuides(slug);
  }
}
