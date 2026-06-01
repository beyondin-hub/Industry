import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getContext } from "@/lib/repos/context";
import { getActiveSector, SECTOR_COOKIE, SECTOR_GENERAL, SECTOR_SLUGS } from "@/lib/sector/context";

export const runtime = "nodejs";

const YEAR = 60 * 60 * 24 * 365;

/** Sector actual del comprador autenticado. */
export async function GET() {
  const { sector, configured } = await getActiveSector();
  return NextResponse.json({ sector, configured });
}

/**
 * Persiste el sector del comprador en buyers (solo si hay sesión real).
 * slug === null → manufactura general (sin sector, pero ya configurado).
 */
async function persistToDb(slug: string | null) {
  const supabase = createClient();
  const ctx = await getContext();
  if (!supabase || ctx.isDemo || !ctx.userId) return;
  try {
    let sectorId: string | null = null;
    if (slug) {
      const { data: sec } = await supabase
        .from("industry_sectors")
        .select("id")
        .eq("slug", slug)
        .single();
      sectorId = sec?.id ?? null;
    }
    await supabase
      .from("buyers")
      .update({
        sector_id: sectorId,
        sector_configurado: true,
        sector_configurado_at: new Date().toISOString(),
      })
      .eq("id", ctx.userId);
  } catch {
    /* la cookie ya garantiza la experiencia; no rompemos la respuesta */
  }
}

/** Actualiza (configura) el sector del comprador. */
export async function PUT(req: Request) {
  let slug: string | undefined;
  try {
    const body = (await req.json()) as { sector_slug?: string };
    slug = body.sector_slug;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  // 'general': onboarding hecho pero sin filtro de sector (catálogo completo).
  if (slug === SECTOR_GENERAL || slug === null) {
    cookies().set(SECTOR_COOKIE, SECTOR_GENERAL, { maxAge: YEAR, path: "/", sameSite: "lax" });
    await persistToDb(null);
    return NextResponse.json({ ok: true, sector: null });
  }

  if (!slug || !SECTOR_SLUGS.includes(slug as (typeof SECTOR_SLUGS)[number])) {
    return NextResponse.json(
      { error: `Sector inválido. Usa uno de: ${SECTOR_SLUGS.join(", ")} o 'general'.` },
      { status: 400 },
    );
  }

  cookies().set(SECTOR_COOKIE, slug, { maxAge: YEAR, path: "/", sameSite: "lax" });
  await persistToDb(slug);

  const { sector } = await getActiveSector();
  return NextResponse.json({ ok: true, sector });
}
