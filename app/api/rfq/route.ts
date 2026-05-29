import { NextResponse } from "next/server";
import { deadlineHabil } from "@/lib/rfq/sla";
import { folio } from "@/lib/utils";

export const runtime = "nodejs";

interface RFQItemInput {
  descripcion: string;
  numero_parte?: string;
  cantidad: number;
  unidad?: string;
  certificacion?: string;
}

/**
 * Crea un RFQ. En producción persiste en Supabase y dispara notificaciones
 * (Twilio WhatsApp + Resend email) a la mesa de operaciones y proveedores.
 * En el MVP demo devuelve el folio y el deadline de la garantía de 2 horas.
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

    // TODO(prod): insertar en Supabase (rfqs + rfq_items) y notificar por WhatsApp/email.
    return NextResponse.json({
      ok: true,
      folio: folio("MRO", numero),
      estado: "nuevo",
      deadline_cotizacion: deadline.toISOString(),
      deadline_label: "2 horas hábiles",
      items_count: items.length,
    });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
