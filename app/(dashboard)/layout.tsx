import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { AIAssistant } from "@/components/ai-chat/assistant";
import { getContext } from "@/lib/repos/context";
import { getActiveSector } from "@/lib/sector/context";
import { fetchSectorCategories } from "@/lib/repos/sectors";
import { CatalogStoreProvider } from "@/lib/catalog/store";
import { CompareBar } from "@/components/catalog/compare-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { buyer, company, isDemo } = await getContext();

  // Onboarding de sector: si el comprador aún no lo configuró, va al selector.
  const { sector, configured } = await getActiveSector();
  if (!configured) redirect("/onboarding/sector");

  const sectorCategories = sector ? await fetchSectorCategories(sector.slug) : [];
  return (
    <CatalogStoreProvider>
      <div className="flex min-h-screen bg-paper-300">
        <Sidebar isDemo={isDemo} sector={sector} categories={sectorCategories} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar buyer={buyer} company={company} isDemo={isDemo} sector={sector} />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
        <AIAssistant />
        <CompareBar />
      </div>
    </CatalogStoreProvider>
  );
}
