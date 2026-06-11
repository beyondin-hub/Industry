import { NextResponse } from "next/server";
import { getShippingProvider, withRecommended, type CarrierPolicy } from "@/lib/shipping";

export const runtime = "nodejs";

/** Cotiza tarifas multi-carrier para un par origen/destino. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      origen?: { ciudad?: string; estado?: string; cp?: string };
      destino?: { ciudad?: string; estado?: string; cp?: string };
      peso_kg?: number;
      largo_cm?: number;
      ancho_cm?: number;
      alto_cm?: number;
      urgente?: boolean;
      policy?: CarrierPolicy;
    };

    const origenCiudad = body.origen?.ciudad?.trim();
    const destinoCiudad = body.destino?.ciudad?.trim();
    if (!destinoCiudad) {
      return NextResponse.json({ error: "Falta la ciudad destino." }, { status: 400 });
    }

    const provider = getShippingProvider();
    const rates = await provider.cotizar({
      origen: { ciudad: origenCiudad || "Tijuana", estado: body.origen?.estado, cp: body.origen?.cp },
      destino: { ciudad: destinoCiudad, estado: body.destino?.estado, cp: body.destino?.cp },
      paquete: {
        peso_kg: Math.max(1, Number(body.peso_kg) || 5),
        largo_cm: body.largo_cm,
        ancho_cm: body.ancho_cm,
        alto_cm: body.alto_cm,
      },
      urgente: body.urgente,
    });

    const conRecomendado = withRecommended(rates, { policy: body.policy, urgente: body.urgente });
    return NextResponse.json({
      ok: true,
      provider: provider.nombre,
      demo: provider.esDemo,
      rates: conRecomendado,
    });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
