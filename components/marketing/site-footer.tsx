import Link from "next/link";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { BRAND } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t bg-steel-950 text-steel-200">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <Logo variant="light" />
          <p className="max-w-xs text-sm text-steel-400">{BRAND.tagline}</p>
          <p className="max-w-xs text-xs italic text-steel-500">“{BRAND.why}”</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Plataforma</h4>
          <ul className="space-y-2 text-sm text-steel-400">
            <li><Link href="/catalogo" className="hover:text-safety">Catálogo MRO</Link></li>
            <li><Link href="/cotizar" className="hover:text-safety">Solicitar cotización (RFQ)</Link></li>
            <li><Link href="/dashboard" className="hover:text-safety">Dashboard de compras</Link></li>
            <li><Link href="/analytics" className="hover:text-safety">Spend analytics</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Proveedores</h4>
          <ul className="space-y-2 text-sm text-steel-400">
            <li><Link href="/proveedor/dashboard" className="hover:text-safety">Portal de proveedor</Link></li>
            <li><Link href="/registro" className="hover:text-safety">Vender en MROLink</Link></li>
            <li><Link href="/#proveedores" className="hover:text-safety">Membresías</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Contacto</h4>
          <ul className="space-y-2 text-sm text-steel-400">
            <li className="flex items-center gap-2">
              <MessageCircle className="size-4 text-emerald-400" /> {BRAND.whatsapp}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-safety" /> {BRAND.email}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-steel-500" /> Tijuana · Mexicali · Juárez · Monterrey
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-steel-800">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-steel-500 sm:flex-row">
          <p>© {new Date().getFullYear()} MROLink. Todos los derechos reservados.</p>
          <p>Hecho para la industria maquiladora del norte de México 🇲🇽</p>
        </div>
      </div>
    </footer>
  );
}
