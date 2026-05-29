"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { loginAction, magicLinkAction } from "@/app/(auth)/actions";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [magicPending, setMagicPending] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginInput) =>
    startTransition(async () => {
      const res = await loginAction(values);
      if (res.ok) {
        toast({ type: "success", title: "Bienvenido de vuelta" });
        router.push("/dashboard");
        router.refresh();
      } else {
        toast({ type: "error", title: "No pudimos iniciar sesión", description: res.error });
      }
    });

  const onMagicLink = async () => {
    const email = getValues("email");
    setMagicPending(true);
    const res = await magicLinkAction({ email });
    setMagicPending(false);
    if (res.ok) {
      toast({
        type: "success",
        title: "Enlace enviado",
        description: res.message === "demo" ? "Modo demo: entra con tu contraseña." : res.message,
      });
    } else {
      toast({ type: "error", title: "No se pudo enviar", description: res.error });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-950">Bienvenido de vuelta</h1>
        <p className="mt-1 text-sm text-ink-500">Ingresa para gestionar tus compras MRO.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email" className="mb-1.5 block">Correo de trabajo</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <Input id="email" type="email" placeholder="compras@tuempresa.mx" className="pl-9" {...register("email")} />
          </div>
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <button type="button" onClick={onMagicLink} className="text-xs text-safety hover:underline">
              Entrar con enlace mágico
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register("password")} />
          </div>
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>
        <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <>Iniciar sesión <ArrowRight className="size-4" /></>}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={magicPending}
        onClick={onMagicLink}
      >
        {magicPending ? <Loader2 className="size-4 animate-spin" /> : <><Mail className="size-4" /> Enviar enlace mágico (magic link)</>}
      </Button>

      <p className="text-center text-sm text-ink-500">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-safety hover:underline">Crea una gratis</Link>
      </p>
    </div>
  );
}
