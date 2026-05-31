import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authorizeCron } from "@/lib/cron/guard";
import { getShippingProvider } from "@/lib/shipping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sincroniza el estado de los envíos en tránsito con el carrier. */
export async function GET(req: Request) {
  const deny = authorizeCron(req);
  if (deny) return deny;

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, demo: true, actualizados: 0 });
  }

  try {
    const provider = getShippingProvider();
    const { data, error } = await supabase
      .from("shipments")
      .select("id, guia, carrier, estado")
      .in("estado", ["creado", "recolectado", "en_transito"])
      .not("guia", "is", null)
      .limit(100);
    if (error) throw error;

    let actualizados = 0;
    for (const s of data ?? []) {
      if (!s.guia) continue;
      const status = await provider.rastrear(s.guia, s.carrier);
      if (status.estado && status.estado !== s.estado) {
        await supabase.from("shipments").update({ estado: status.estado, updated_at: new Date().toISOString() }).eq("id", s.id);
        for (const ev of status.eventos.slice(-1)) {
          await supabase.from("shipment_events").insert({ shipment_id: s.id, estado: ev.estado, nota: ev.descripcion, ubicacion: ev.ubicacion ?? null, fecha: ev.fecha });
        }
        actualizados++;
      }
    }
    return NextResponse.json({ ok: true, actualizados });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 });
  }
}
