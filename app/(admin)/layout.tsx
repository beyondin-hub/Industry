import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { getAdminContext } from "@/lib/repos/admin-context";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminRole, isDemo, nombre } = await getAdminContext();
  return (
    <div className="flex min-h-screen bg-paper-300">
      <AdminSidebar isDemo={isDemo} role={adminRole} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar nombre={nombre} role={adminRole} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
