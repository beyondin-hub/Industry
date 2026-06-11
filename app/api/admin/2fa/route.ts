import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSecret, otpauthUri, verifyTotp } from "@/lib/auth/twofa";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

/** Genera un secreto TOTP nuevo + URI para el authenticator. */
export async function GET() {
  const secret = generateSecret();
  return NextResponse.json({
    ok: true,
    secret,
    otpauth: otpauthUri(secret, "admin@novak.mx"),
  });
}

/** Verifica el código TOTP y, si hay DB, activa el 2FA del usuario. */
export async function POST(req: Request) {
  try {
    const { secret, code } = (await req.json()) as { secret?: string; code?: string };
    if (!secret || !code) {
      return NextResponse.json({ error: "Faltan secreto o código." }, { status: 400 });
    }
    const valido = verifyTotp(secret, code);
    if (!valido) {
      return NextResponse.json({ ok: false, error: "Código inválido o expirado." }, { status: 401 });
    }

    const supabase = createClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("admin_2fa")
            .upsert({ user_id: user.id, secret, habilitado: true, verificado_at: new Date().toISOString() });
        }
      } catch {
        /* demo */
      }
    }

    await logAudit({ accion: "2fa.activado", entidad: "admin", entidad_id: "admin@novak.mx", detalle: "2FA TOTP verificado y activado" });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
