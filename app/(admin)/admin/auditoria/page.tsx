import { ScrollText, UserCheck, Banknote, FileSpreadsheet, Store, Building, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchAuditLog } from "@/lib/repos/audit";
import { fechaHora } from "@/lib/utils";

export const metadata = { title: "Auditoría" };

const ICON: Record<string, any> = {
  provider: Store, company: Building, rfq: FileSpreadsheet, order: Banknote,
  team_member: UserCheck, default: ShieldCheck,
};

function accionLabel(a: string) {
  const map: Record<string, string> = {
    "provider.approve": "Aprobó proveedor", "provider.reject": "Rechazó proveedor",
    "credit.set_line": "Ajustó línea de crédito", "kyc.set": "Actualizó KYC",
    "company.suspend": "Suspendió comprador", "company.activate": "Reactivó comprador",
    "quotation.create": "Generó cotización", "payout.disperse": "Dispersó pago",
    "team.invite": "Invitó operador", "team.update_role": "Cambió rol", "team.suspend": "Suspendió operador", "team.activate": "Reactivó operador",
  };
  return map[a] ?? a;
}

export default async function AuditoriaPage() {
  const log = await fetchAuditLog();
  return (
    <div className="space-y-6">
      <PageHeader title="Auditoría" description="Bitácora de acciones del equipo Novak: quién hizo qué y cuándo" />
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {log.map((e) => {
              const Icon = ICON[e.entidad] ?? ICON.default;
              return (
                <div key={e.id} className="flex items-start gap-3 p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-ink-600"><Icon className="size-4" /></span>
                  <div className="flex-1">
                    <p className="text-sm text-ink-900">
                      <strong>{e.actor_nombre}</strong> · {accionLabel(e.accion)}
                      {e.entidad_id && <span className="font-mono text-xs text-ink-500"> · {e.entidad_id}</span>}
                    </p>
                    {e.detalle && <p className="mt-0.5 text-xs text-ink-500">{e.detalle}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant="secondary" className="text-[10px]">{e.entidad}</Badge>
                    <p className="mt-1 text-[11px] text-ink-400">{fechaHora(e.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
