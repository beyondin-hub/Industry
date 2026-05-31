import { NextResponse } from "next/server";

/**
 * Verifica que la petición provenga de Vercel Cron o de un llamador
 * autorizado. Vercel envía `Authorization: Bearer $CRON_SECRET`.
 * En demo (sin CRON_SECRET) se permite para poder probar manualmente.
 */
export function authorizeCron(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return null; // demo: abierto
  const got = req.headers.get("authorization");
  if (got === `Bearer ${secret}`) return null;
  return NextResponse.json({ error: "No autorizado." }, { status: 401 });
}
