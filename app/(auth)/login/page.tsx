import Link from "next/link";
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, magicLinkAction } from "@/app/(auth)/actions";

export const metadata = { title: "Iniciar sesión" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; sent?: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-steel-950">Bienvenido de vuelta</h1>
        <p className="mt-1 text-sm text-steel-500">Ingresa para gestionar tus compras MRO.</p>
      </div>

      {searchParams.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" /> {searchParams.error}
        </div>
      )}
      {searchParams.sent && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0" /> Te enviamos un enlace de acceso a tu correo.
        </div>
      )}

      <form action={loginAction} className="space-y-4">
        <div>
          <Label htmlFor="email" className="mb-1.5 block">Correo de trabajo</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-400" />
            <Input id="email" name="email" type="email" required placeholder="compras@tuempresa.mx" className="pl-9" />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link href="#" className="text-xs text-safety hover:underline">¿Olvidaste?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-400" />
            <Input id="password" name="password" type="password" required placeholder="••••••••" className="pl-9" />
          </div>
        </div>
        <Button type="submit" variant="accent" size="lg" className="w-full">
          Iniciar sesión <ArrowRight className="size-4" />
        </Button>
      </form>

      <div className="relative text-center">
        <span className="relative z-10 bg-background px-3 text-xs text-steel-400">o</span>
        <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
      </div>

      <form action={magicLinkAction} className="space-y-2">
        <Input name="email" type="email" required placeholder="Tu correo para el enlace mágico" />
        <Button type="submit" variant="outline" size="lg" className="w-full">
          <Mail className="size-4" /> Enviar enlace mágico (magic link)
        </Button>
      </form>

      <p className="text-center text-sm text-steel-500">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-safety hover:underline">
          Crea una gratis
        </Link>
      </p>
    </div>
  );
}
