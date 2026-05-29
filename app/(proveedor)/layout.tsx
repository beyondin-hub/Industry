import { ProviderSidebar } from "@/components/proveedor/provider-sidebar";
import { ProviderTopbar } from "@/components/proveedor/provider-topbar";
import { getProviderContext } from "@/lib/repos/provider-context";

export default async function ProveedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { provider } = await getProviderContext();
  return (
    <div className="flex min-h-screen bg-paper-300">
      <ProviderSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <ProviderTopbar
          nombre={provider.nombre_comercial}
          ciudad={provider.ciudad}
          score={provider.score}
        />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
