import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#categorias", label: "Categorías" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#proveedores", label: "Para proveedores" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-sm font-medium text-steel-700 transition-colors hover:text-safety"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={BRAND.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 sm:inline-flex"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className={cn(buttonVariants({ variant: "accent", size: "sm" }))}
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </header>
  );
}
