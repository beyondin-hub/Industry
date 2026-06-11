import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authorizeCron } from "@/lib/cron/guard";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Avisa a proveedores con certificaciones por vencer (30 días). */
export async function GET(req: Request) {
  const deny = authorizeCron(req);
  if (deny) return deny;

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, demo: true, por_vencer: 0 });
  }

  try {
    const en30 = new Date(Date.now() + 30 * 24 * 36e5).toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("provider_certifications")
      .select("id, provider_id, nombre, vence")
      .not("vence", "is", null)
      .lte("vence", en30)
      .limit(300);
    if (error) throw error;

    const porVencer = (data ?? []).length;
    if (porVencer) {
      await logAudit({ accion: "cert.por_vencer", entidad: "certificaciones", entidad_id: "*", detalle: `${porVencer} certificaciones por vencer en 30 días` });
    }
    return NextResponse.json({ ok: true, por_vencer: porVencer });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
