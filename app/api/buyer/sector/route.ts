import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getContext } from "@/lib/repos/context";
import { getActiveSector, SECTOR_COOKIE, SECTOR_SLUGS } from "@/lib/sector/context";

export const runtime = "nodejs";

/** Sector actual del comprador autenticado. */
export async function GET() {
  const { sector, configured } = await getActiveSector();
  return NextResponse.json({ sector, configured });
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

  // 'general' limpia el sector (catálogo sin filtro).
  if (slug === "general" || slug === null) {
    cookies().set(SECTOR_COOKIE, "", { maxAge: 0, path: "/" });
    return NextResponse.json({ ok: true, sector: null });
  }

  if (!slug || !SECTOR_SLUGS.includes(slug as (typeof SECTOR_SLUGS)[number])) {
    return NextResponse.json(
      { error: `Sector inválido. Usa uno de: ${SECTOR_SLUGS.join(", ")} o 'general'.` },
      { status: 400 },
    );
  }

  // Persiste en cookie (modo demo y fast-path) — 1 año.
  cookies().set(SECTOR_COOKIE, slug, { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" });

  // Persiste en DB si hay sesión real.
  const supabase = createClient();
  const ctx = await getContext();
  if (supabase && !ctx.isDemo && ctx.userId) {
    try {
      const { data: sec } = await supabase
        .from("industry_sectors")
        .select("id")
        .eq("slug", slug)
        .single();
      if (sec?.id) {
        await supabase
          .from("buyers")
          .update({
            sector_id: sec.id,
            sector_configurado: true,
            sector_configurado_at: new Date().toISOString(),
          })
          .eq("id", ctx.userId);
      }
    } catch {
      /* la cookie ya garantiza la experiencia; no rompemos la respuesta */
    }
  }

  const { sector } = await getActiveSector();
  return NextResponse.json({ ok: true, sector });
}
