import { NextResponse } from "next/server";
import { redactContact } from "@/lib/anti-bypass";
import { createClient } from "@/lib/supabase/server";
import { getProviderContext } from "@/lib/repos/provider-context";

export const runtime = "nodejs";

/**
 * Envía un mensaje en la mensajería mediada. SIEMPRE redacta datos de
 * contacto (tel/email/URL) antes de devolver/persistir — pilar anti-bypass.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { rfq_id?: string; cuerpo?: string; remitente?: string };
    const cuerpo = (body.cuerpo ?? "").trim();
    if (!cuerpo) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });

    const { limpio, redactado } = redactContact(cuerpo);

    // Persistencia opcional (si hay Supabase + proveedor en sesión).
    const supabase = createClient();
    if (supabase && body.rfq_id) {
      try {
        const ctx = await getProviderContext();
        if (!ctx.isDemo) {
          await supabase.from("messages").insert({
            rfq_id: body.rfq_id,
            provider_id: ctx.provider.id,
            remitente: body.remitente === "comprador" ? "comprador" : "proveedor",
            remitente_id: ctx.userId,
            cuerpo: limpio,
            redactado,
          });
        }
      } catch {
        /* demo: ignora persistencia */
      }
    }

    return NextResponse.json({
      id: crypto.randomUUID(),
      cuerpo: limpio,
      redactado,
      created_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
}
