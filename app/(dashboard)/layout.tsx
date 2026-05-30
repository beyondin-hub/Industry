import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { AIAssistant } from "@/components/ai-chat/assistant";
import { getContext } from "@/lib/repos/context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { buyer, company, isDemo } = await getContext();
  return (
    <div className="flex min-h-screen bg-paper-300">
      <Sidebar isDemo={isDemo} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar buyer={buyer} company={company} isDemo={isDemo} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
      <AIAssistant />
    </div>
  );
}
