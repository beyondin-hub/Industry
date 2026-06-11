import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getActiveSector } from "@/lib/sector/context";
import { getContext } from "@/lib/repos/context";
import { fetchOrders } from "@/lib/repos/orders";
import { AuditKit } from "@/components/sector/audit-kit";

export const metadata = { title: "Kit de Auditoría · NOVAK Med" };

export default async function AuditKitPage() {
  const { sector } = await getActiveSector();

  if (sector?.slug !== "medical") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center">
        <p className="text-lg font-semibold text-ink-900">Kit de Auditoría</p>
        <p className="mt-2 text-sm text-ink-600">
          Esta herramienta es exclusiva de <strong>NOVAK Med</strong>. Cambia tu sector a
          manufactura de dispositivos médicos para usarla.
        </p>
        <Link href="/onboarding/sector" className={`mt-4 ${buttonVariants({ variant: "accent" })}`}>
          Cambiar sector
        </Link>
      </div>
    );
  }

  const { company } = await getContext();
  const orders = await fetchOrders(company.id);

  return <AuditKit color={sector.color_primario} orders={orders.slice(0, 12)} />;
}
