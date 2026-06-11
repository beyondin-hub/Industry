import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

/**
 * Shell público del marketplace: header y footer de marketing, sin sidebar
 * ni onboarding. Las rutas /productos/* son navegables sin sesión.
 */
export default function ProductosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
