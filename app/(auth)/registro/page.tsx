import Link from "next/link";
import { ArrowRight, Building2, Store, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CIUDADES, INDUSTRIAS } from "@/lib/constants";
import { signUpAction } from "@/app/(auth)/actions";

export const metadata = { title: "Crear cuenta" };

export default function RegistroPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-steel-950">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-steel-500">
          Empieza a cotizar en minutos. Sin costo de registro.
        </p>
      </div>

      {searchParams.error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" /> {searchParams.error}
        </div>
      )}

      {/* Tipo de cuenta */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border-2 border-safety bg-safety-50 p-3 text-center">
          <Building2 className="mx-auto mb-1 size-5 text-safety" />
          <p className="text-sm font-semibold text-steel-900">Soy comprador</p>
          <p className="text-[11px] text-steel-500">Maquiladora / planta</p>
        </div>
        <Link href="/proveedor/dashboard" className="rounded-lg border-2 border-transparent bg-steel-50 p-3 text-center hover:border-steel-200">
          <Store className="mx-auto mb-1 size-5 text-steel-500" />
          <p className="text-sm font-semibold text-steel-900">Soy proveedor</p>
          <p className="text-[11px] text-steel-500">Quiero vender MRO</p>
        </Link>
      </div>

      <form action={signUpAction} className="space-y-4">
        <div>
          <Label className="mb-1.5 block">Nombre de la empresa</Label>
          <Input name="empresa" required placeholder="Maquiladora del Pacífico SA de CV" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1.5 block">RFC</Label>
            <Input name="rfc" required placeholder="ABC123456XYZ" className="font-mono uppercase" />
          </div>
          <div>
            <Label className="mb-1.5 block">Ciudad</Label>
            <Select name="ciudad" required defaultValue="">
              <option value="" disabled>Selecciona…</option>
              {CIUDADES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Industria</Label>
          <Select name="industria" required defaultValue="">
            <option value="" disabled>Selecciona…</option>
            {INDUSTRIAS.map((i) => <option key={i.slug} value={i.slug}>{i.nombre}</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1.5 block">Tu nombre</Label>
            <Input name="nombre" required placeholder="Nombre y apellido" />
          </div>
          <div>
            <Label className="mb-1.5 block">WhatsApp</Label>
            <Input name="telefono" required type="tel" placeholder="+52 664 ..." />
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Correo de trabajo</Label>
          <Input name="email" required type="email" placeholder="compras@tuempresa.mx" />
        </div>
        <div>
          <Label className="mb-1.5 block">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-400" />
            <Input name="password" required type="password" minLength={6} placeholder="Mínimo 6 caracteres" className="pl-9" />
          </div>
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full">
          Crear cuenta gratis <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-steel-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-safety hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
