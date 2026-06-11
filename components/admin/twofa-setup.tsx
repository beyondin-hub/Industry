"use client";

import { useState } from "react";
import { ShieldCheck, Loader2, KeyRound, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export function TwoFaSetup({ enabled }: { enabled: boolean }) {
  const { toast } = useToast();
  const [secret, setSecret] = useState<string | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activo, setActivo] = useState(false);
  const [copied, setCopied] = useState(false);

  async function iniciar() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/2fa");
      const data = await res.json();
      setSecret(data.secret);
      setUri(data.otpauth);
    } catch {
      toast({ type: "error", title: "No se pudo iniciar el registro" });
    } finally {
      setLoading(false);
    }
  }

  async function verificar() {
    if (!secret) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/admin/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActivo(true);
      toast({ type: "success", title: "2FA activado", description: "Tu cuenta admin quedó protegida con TOTP." });
    } catch (e: any) {
      toast({ type: "error", title: "Código inválido", description: e?.message });
    } finally {
      setVerifying(false);
    }
  }

  function copiar() {
    if (!secret) return;
    navigator.clipboard?.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4 text-safety" /> Autenticación de dos factores (2FA)
          {activo ? (
            <Badge variant="success">Activo</Badge>
          ) : (
            <Badge variant={enabled ? "warning" : "secondary"}>{enabled ? "Requerido" : "Opcional"}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-ink-500">
          Protege las cuentas del equipo Novak con un código TOTP (Google Authenticator, Authy).
          {enabled ? " Es obligatorio en este entorno." : " Recomendado para super admins."}
        </p>

        {!secret && !activo && (
          <Button variant="accent" onClick={iniciar} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Configurar 2FA
          </Button>
        )}

        {secret && !activo && (
          <div className="space-y-3 rounded-xl border bg-secondary/20 p-4">
            <div>
              <p className="text-xs font-medium text-ink-600">1. Escanea o ingresa esta clave en tu app authenticator:</p>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="rounded bg-ink-950 px-3 py-1.5 font-mono text-sm tracking-widest text-ink-100">{secret}</code>
                <Button variant="ghost" size="sm" onClick={copiar}>
                  {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                </Button>
              </div>
              {uri && <p className="mt-1 break-all text-[11px] text-ink-400">{uri}</p>}
            </div>
            <div>
              <p className="text-xs font-medium text-ink-600">2. Ingresa el código de 6 dígitos que muestra tu app:</p>
              <div className="mt-1.5 flex gap-2">
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-32 font-mono tracking-widest"
                />
                <Button variant="accent" onClick={verificar} disabled={verifying || code.length !== 6}>
                  {verifying ? <Loader2 className="size-4 animate-spin" /> : null} Verificar y activar
                </Button>
              </div>
            </div>
          </div>
        )}

        {activo && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm text-emerald-700">
            <ShieldCheck className="size-5" /> 2FA activo. Se pedirá el código en cada inicio de sesión del panel.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
