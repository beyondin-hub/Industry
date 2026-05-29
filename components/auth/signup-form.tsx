"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, Store, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { CIUDADES, INDUSTRIAS } from "@/lib/constants";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { signUpAction } from "@/app/(auth)/actions";

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs text-danger">{msg}</p> : null;
}

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      empresa: "", rfc: "", ciudad: "", industria: "", nombre: "", telefono: "", email: "", password: "",
    },
  });

  const onSubmit = (values: SignupInput) =>
    startTransition(async () => {
      const res = await signUpAction(values);
      if (res.ok) {
        toast({ type: "success", title: "¡Cuenta creada!", description: "Bienvenido a MROLink." });
        router.push("/dashboard");
        router.refresh();
      } else {
        toast({ type: "error", title: "No se pudo crear la cuenta", description: res.error });
      }
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-950">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-ink-500">Empieza a cotizar en minutos. Sin costo de registro.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border-2 border-safety bg-safety-50 p-3 text-center">
          <Building2 className="mx-auto mb-1 size-5 text-safety" />
          <p className="text-sm font-semibold text-ink-900">Soy comprador</p>
          <p className="text-[11px] text-ink-500">Maquiladora / planta</p>
        </div>
        <Link href="/proveedor/dashboard" className="rounded-lg border-2 border-transparent bg-secondary p-3 text-center hover:border-border">
          <Store className="mx-auto mb-1 size-5 text-ink-500" />
          <p className="text-sm font-semibold text-ink-900">Soy proveedor</p>
          <p className="text-[11px] text-ink-500">Quiero vender MRO</p>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label className="mb-1.5 block">Nombre de la empresa</Label>
          <Input placeholder="Maquiladora del Pacífico SA de CV" {...register("empresa")} />
          <Err msg={errors.empresa?.message} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1.5 block">RFC</Label>
            <Input placeholder="ABC123456XY7" className="font-mono uppercase" {...register("rfc")} />
            <Err msg={errors.rfc?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block">Ciudad</Label>
            <Select defaultValue="" {...register("ciudad")}>
              <option value="" disabled>Selecciona…</option>
              {CIUDADES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Err msg={errors.ciudad?.message} />
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Industria</Label>
          <Select defaultValue="" {...register("industria")}>
            <option value="" disabled>Selecciona…</option>
            {INDUSTRIAS.map((i) => <option key={i.slug} value={i.slug}>{i.nombre}</option>)}
          </Select>
          <Err msg={errors.industria?.message} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1.5 block">Tu nombre</Label>
            <Input placeholder="Nombre y apellido" {...register("nombre")} />
            <Err msg={errors.nombre?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block">WhatsApp</Label>
            <Input type="tel" placeholder="+52 664 ..." {...register("telefono")} />
            <Err msg={errors.telefono?.message} />
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Correo de trabajo</Label>
          <Input type="email" placeholder="compras@tuempresa.mx" {...register("email")} />
          <Err msg={errors.email?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <Input type="password" placeholder="Mínimo 6 caracteres" className="pl-9" {...register("password")} />
          </div>
          <Err msg={errors.password?.message} />
        </div>

        <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <>Crear cuenta gratis <ArrowRight className="size-4" /></>}
        </Button>
      </form>

      <p className="text-center text-sm text-ink-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-safety hover:underline">Inicia sesión</Link>
      </p>
    </div>
  );
}
