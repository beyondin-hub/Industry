import { PageHeader } from "@/components/dashboard/page-header";
import { ConfigForm } from "@/components/admin/config-form";
import { fetchPlatformConfig } from "@/lib/repos/config";

export const metadata = { title: "Configuración" };

export default async function ConfigPage() {
  const cfg = await fetchPlatformConfig();
  return (
    <div className="space-y-6">
      <PageHeader title="Configuración de plataforma" description="Comisiones, parámetros de crédito, fees y feature flags — las palancas del negocio" />
      <ConfigForm initial={cfg} />
    </div>
  );
}
