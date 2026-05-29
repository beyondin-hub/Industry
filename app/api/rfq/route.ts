import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getContext } from "@/lib/repos/context";
import { deadlineHabil } from "@/lib/rfq/sla";
import { folio } from "@/lib/utils";
import { sendWhatsApp, waTemplates } from "@/lib/twilio/whatsapp";

export const runtime = "nodejs";

interface RFQItemInput {
  descripcion: string;
  numero_parte?: string;
  cantidad: number;
  unidad?: string;
  certificacion?: string;
}

/**
 * Crea un RFQ. Si Supabase está configurado y hay sesión, persiste en
 * `rfqs` + `rfq_items` y notifica por WhatsApp. Si no, responde en modo demo.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      items?: RFQItemInput[];
      urgencia?: string;
      condicion_pago?: string;
      requiere_cfdi?: boolean;
      notas?: string;
    };

    const items = (body.items ?? []).filter((i) => i.descripcion && i.cantidad > 0);
    if (items.length === 0) {
      return NextResponse.json(
        { error: "Agrega al menos una partida con descripción y cantidad." },
        { status: 400 },
      );
    }

    const deadline = deadlineHabil(2);
    const numero = Math.floor(150 + Math.random() * 800);
    const nuevoFolio = folio("MRO", numero);
    const urgencia = ["urgente_24h", "normal", "programado"].includes(body.urgencia ?? "")
      ? body.urgencia
      : "normal";
    const condicion_pago = ["contado", "30", "60", "90"].includes(body.condicion_pago ?? "")
      ? body.condicion_pago
      : "contado";

    const supabase = createClient();
    const ctx = await getContext();

    // Modo demo: sin DB o sin sesión real.
    if (!supabase || ctx.isDemo) {
      return NextResponse.json({
        ok: true,
        folio: nuevoFolio,
        estado: "nuevo",
        deadline_cotizacion: deadline.toISOString(),
        deadline_label: "2 horas hábiles",
        items_count: items.length,
        persisted: false,
      });
    }

    // Persistencia real.
    const { data: rfq, error: rfqErr } = await supabase
      .from("rfqs")
      .insert({
        folio: nuevoFolio,
        buyer_id: ctx.userId,
        company_id: ctx.company.id,
        estado: "nuevo",
        urgencia,
        condicion_pago,
        requiere_cfdi: body.requiere_cfdi ?? true,
        notas: body.notas ?? null,
        deadline_cotizacion: deadline.toISOString(),
      })
      .select("id, folio")
      .single();

    if (rfqErr || !rfq) {
      return NextResponse.json(
        { error: "No se pudo crear el RFQ.", detail: rfqErr?.message },
        { status: 500 },
      );
    }

    const { error: itemsErr } = await supabase.from("rfq_items").insert(
      items.map((it) => ({
        rfq_id: rfq.id,
        descripcion: it.descripcion,
        numero_parte: it.numero_parte || null,
        cantidad: it.cantidad,
        unidad: it.unidad || "pza",
        certificacion_requerida: it.certificacion || null,
      })),
    );

    if (itemsErr) {
      return NextResponse.json(
        { error: "RFQ creado pero fallaron las partidas.", detail: itemsErr.message },
        { status: 500 },
      );
    }

    // Notificación WhatsApp (degrada a no-op en demo).
    if (ctx.buyer.telefono) {
      await sendWhatsApp({
        to: ctx.buyer.telefono,
        body: waTemplates.rfqRecibido(rfq.folio),
      }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      id: rfq.id,
      folio: rfq.folio,
      estado: "nuevo",
      deadline_cotizacion: deadline.toISOString(),
      deadline_label: "2 horas hábiles",
      items_count: items.length,
      persisted: true,
    });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
