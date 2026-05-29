import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { AIAssistant } from "@/components/ai-chat/assistant";
import { getContext } from "@/lib/repos/context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { buyer, company } = await getContext();
  return (
    <div className="flex min-h-screen bg-steel-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar buyer={buyer} company={company} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
      <AIAssistant />
    </div>
  );
}
