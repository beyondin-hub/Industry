// ────────────────────────────────────────────────────────────
// Novak — 2FA TOTP (RFC 6238) para el equipo admin.
// Implementación nativa con crypto (sin dependencias). Compatible con
// Google Authenticator / Authy. Conmutable: se exige solo si
// ADMIN_2FA_ENABLED=true; en demo permite validar el flujo.
// ────────────────────────────────────────────────────────────

import crypto from "crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Genera un secreto base32 para el authenticator. */
export function generateSecret(bytes = 20): string {
  const buf = crypto.randomBytes(bytes);
  let bits = "";
  for (let i = 0; i < buf.length; i++) bits += buf[i].toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += BASE32[parseInt(bits.slice(i, i + 5), 2)];
  }
  return out;
}

function base32Decode(s: string): Buffer {
  const clean = s.replace(/=+$/, "").toUpperCase().replace(/\s/g, "");
  let bits = "";
  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32.indexOf(clean[i]);
    if (idx < 0) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/** Código TOTP de 6 dígitos para un secreto y ventana de tiempo. */
export function totp(secret: string, forStep?: number, step = 30, digits = 6): string {
  const counter = forStep ?? Math.floor(Date.now() / 1000 / step);
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (bin % 10 ** digits).toString().padStart(digits, "0");
}

/** Verifica un código aceptando ±1 ventana (drift de reloj). */
export function verifyTotp(secret: string, code: string, window = 1, step = 30): boolean {
  if (!/^\d{6}$/.test(code.trim())) return false;
  const now = Math.floor(Date.now() / 1000 / step);
  for (let w = -window; w <= window; w++) {
    if (totp(secret, now + w, step) === code.trim()) return true;
  }
  return false;
}

/** URI otpauth:// para configurar el authenticator (QR). */
export function otpauthUri(secret: string, cuenta: string, issuer = "Novak"): string {
  const label = encodeURIComponent(`${issuer}:${cuenta}`);
  const params = new URLSearchParams({ secret, issuer, algorithm: "SHA1", digits: "6", period: "30" });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function is2faEnabled(): boolean {
  return process.env.ADMIN_2FA_ENABLED === "true";
}
