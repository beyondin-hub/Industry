import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Genera el Kit de Auditoría (Med). En modo demo devuelve una URL simulada;
 * en producción aquí se ensamblaría el ZIP (CFDI + COA + certificaciones).
 */
export async function POST(req: Request) {
  let body: { days?: number; include?: string[]; order_ids?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    /* cuerpo opcional */
  }
  const fecha = new Date().toISOString().slice(0, 10);
  return NextResponse.json({
    ok: true,
    download_url: `/demo/Kit_Auditoria_NOVAK_Med_${fecha}.zip`,
    expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    contents: body.include ?? [],
    orders: body.order_ids?.length ?? 0,
    persisted: false,
  });
}
