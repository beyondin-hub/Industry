import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-steel-50 p-6 text-center">
      <Logo />
      <div>
        <p className="text-6xl font-extrabold text-steel-200">404</p>
        <h1 className="mt-2 text-xl font-bold text-steel-900">Esta página no está en stock</h1>
        <p className="mt-1 text-steel-500">Pero seguro tenemos lo que tu planta necesita.</p>
      </div>
      <div className="flex gap-2">
        <Link href="/" className={buttonVariants({ variant: "outline" })}>Ir al inicio</Link>
        <Link href="/catalogo" className={buttonVariants({ variant: "accent" })}>Ver catálogo</Link>
      </div>
    </div>
  );
}
