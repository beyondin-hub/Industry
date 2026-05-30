import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isDemo = !isSupabaseConfigured;
  return (
    <div className="flex min-h-screen bg-paper-300">
      <AdminSidebar isDemo={isDemo} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
