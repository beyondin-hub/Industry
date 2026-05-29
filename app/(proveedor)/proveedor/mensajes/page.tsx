import { PageHeader } from "@/components/dashboard/page-header";
import { MessageThread } from "@/components/proveedor/message-thread";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, ShieldCheck, Ban } from "lucide-react";

export const metadata = { title: "Mensajes" };

export default function ProveedorMensajesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensajes"
        description="Comunicación mediada por Novak. La identidad del comprador y los datos de contacto se mantienen protegidos."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <MessageThread />
        <Card className="bg-secondary/40">
          <CardContent className="space-y-3 p-5 text-sm">
            <p className="font-display font-semibold text-ink-900">¿Por qué así?</p>
            <p className="flex gap-2 text-ink-600"><Lock className="size-4 shrink-0 text-ink-500" /> Toda la conversación queda dentro de Novak.</p>
            <p className="flex gap-2 text-ink-600"><Ban className="size-4 shrink-0 text-danger" /> Se ocultan teléfonos, correos y enlaces automáticamente.</p>
            <p className="flex gap-2 text-ink-600"><ShieldCheck className="size-4 shrink-0 text-emerald-600" /> Novak factura y cobra a la maquila; tú cobras seguro.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
