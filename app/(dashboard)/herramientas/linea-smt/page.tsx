import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getActiveSector } from "@/lib/sector/context";
import { fetchSectorProducts } from "@/lib/repos/sectors";
import { SmtKit } from "@/components/sector/smt-kit";

export const metadata = { title: "Kit de Línea SMT · NOVAK Electronics" };

export default async function SmtKitPage() {
  const { sector } = await getActiveSector();

  if (sector?.slug !== "electronics") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center">
        <p className="text-lg font-semibold text-ink-900">Kit de Línea SMT</p>
        <p className="mt-2 text-sm text-ink-600">
          Esta herramienta es exclusiva de <strong>NOVAK Electronics</strong>. Cambia tu sector a
          manufactura electrónica para usarla.
        </p>
        <Link href="/onboarding/sector" className={`mt-4 ${buttonVariants({ variant: "accent" })}`}>
          Cambiar sector
        </Link>
      </div>
    );
  }

  const products = await fetchSectorProducts("electronics");
  return <SmtKit color={sector.color_primario} products={products} />;
}
