import Link from "next/link";
import { Mail, Lock, ArrowRight, MessageCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-steel-950">Bienvenido de vuelta</h1>
        <p className="mt-1 text-sm text-steel-500">Ingresa para gestionar tus compras MRO.</p>
      </div>

      {/* En el MVP el botón entra directo al dashboard demo */}
      <form action="/dashboard" className="space-y-4">
        <div>
          <Label htmlFor="email" className="mb-1.5 block">Correo de trabajo</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-400" />
            <Input id="email" name="email" type="email" placeholder="compras@tuempresa.mx" className="pl-9" />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link href="#" className="text-xs text-safety hover:underline">¿Olvidaste?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-400" />
            <Input id="password" name="password" type="password" placeholder="••••••••" className="pl-9" />
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

      <Button variant="outline" size="lg" className="w-full">
        <Mail className="size-4" /> Enviar enlace mágico (magic link)
      </Button>

      <p className="text-center text-sm text-steel-500">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-safety hover:underline">
          Crea una gratis
        </Link>
      </p>
    </div>
  );
}
