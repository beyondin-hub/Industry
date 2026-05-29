import { PageHeader } from "@/components/dashboard/page-header";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { NOTIFICATIONS } from "@/lib/data/account";

export const metadata = { title: "Notificaciones" };

export default function NotificacionesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        description="Cotizaciones, órdenes, stock y crédito — sincronizadas con WhatsApp y email"
      />
      <NotificationCenter initial={NOTIFICATIONS} />
    </div>
  );
}
