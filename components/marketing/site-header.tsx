import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { CategoriesMenu } from "@/components/marketing/categories-menu";
import { MobileMenu } from "@/components/marketing/mobile-menu";
import { SmartSearch } from "@/components/catalog/smart-search";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <CategoriesMenu />
        </div>

        {/* Buscador integrado (desktop) */}
        <div className="hidden flex-1 justify-center md:flex">
          <SmartSearch basePath="/productos" placeholder="Número de parte, descripción o marca…" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Cluster desktop */}
          <Link
            href="/vender"
            className="hidden text-sm font-medium text-steel-700 transition-colors hover:text-safety lg:inline"
          >
            Para proveedores
          </Link>
          <a
            href={BRAND.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 md:inline-flex"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden md:inline-flex")}>
            Iniciar sesión
          </Link>
          <Link href="/registro" className={cn(buttonVariants({ variant: "accent", size: "sm" }), "hidden md:inline-flex")}>
            Crear cuenta
          </Link>
          {/* Menú móvil */}
          <MobileMenu />
        </div>
      </div>

      {/* Buscador (mobile) */}
      <div className="container pb-3 md:hidden">
        <SmartSearch basePath="/productos" placeholder="Busca por número de parte o descripción…" />
      </div>
    </header>
  );
}
