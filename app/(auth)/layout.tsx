import Link from "next/link";
import { Clock, Truck, ShieldCheck, MessageCircle } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { BRAND } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-steel-950 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <Logo variant="light" />
        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold leading-tight text-balance">
            Tu equipo de compras externo para la industria maquiladora.
          </h2>
          <p className="max-w-md text-steel-400">“{BRAND.why}”</p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Clock className="size-5 text-purplecow-500" /> Cotización en menos de 2 horas hábiles
            </li>
            <li className="flex items-center gap-3">
              <Truck className="size-5 text-safety" /> Entrega 24–48h en top SKUs
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-emerald-400" /> Proveedores 100% certificados
            </li>
          </ul>
        </div>
        <a
          href={BRAND.whatsappLink}
          className="relative flex items-center gap-2 text-sm text-steel-400 hover:text-white"
        >
          <MessageCircle className="size-4" /> {BRAND.whatsapp}
        </a>
      </div>

      {/* Form side */}
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
          <p className="mt-8 text-center text-xs text-steel-400">
            Al continuar aceptas los <Link href="#" className="underline">Términos</Link> y el{" "}
            <Link href="#" className="underline">Aviso de Privacidad</Link> de MROLink.
          </p>
        </div>
      </div>
    </div>
  );
}
