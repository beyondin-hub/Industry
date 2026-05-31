import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getShippingProvider } from "@/lib/shipping";

export const runtime = "nodejs";

/**
 * Webhook de tracking del carrier (EnvíaYa). Actualiza el estado del envío
 * y registra el evento. Verifica el secreto compartido si está configurado.
 */
export async function POST(req: Request) {
  try {
    const secret = process.env.ENVIAYA_WEBHOOK_SECRET?.trim();
    if (secret) {
      const got = req.headers.get("x-enviaya-signature") ?? req.headers.get("x-webhook-secret");
      if (got !== secret) {
        return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
      }
    }

    const payload = await req.json();
    const provider = getShippingProvider();
    const status = provider.parseWebhook(payload);
    if (!status) {
      return NextResponse.json({ ok: false, error: "Payload no reconocido." }, { status: 202 });
    }

    const supabase = createClient();
    if (supabase) {
      try {
        const { data: shp } = await supabase
          .from("shipments")
          .select("id")
          .eq("guia", status.guia)
          .maybeSingle();
        if (shp?.id) {
          await supabase
            .from("shipments")
            .update({ estado: status.estado, updated_at: new Date().toISOString() })
            .eq("id", shp.id);
          for (const ev of status.eventos) {
            await supabase.from("shipment_events").insert({
              shipment_id: shp.id,
              estado: ev.estado,
              nota: ev.descripcion,
              ubicacion: ev.ubicacion ?? null,
              fecha: ev.fecha,
            });
          }
        }
      } catch {
        /* demo */
      }
    }

    return NextResponse.json({ ok: true, guia: status.guia, estado: status.estado });
  } catch {
    return NextResponse.json({ error: "Webhook inválido." }, { status: 400 });
  }
}
