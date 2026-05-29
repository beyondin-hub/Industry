import { Building2, CreditCard, ShieldCheck, Users, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CURRENT_COMPANY, TEAM } from "@/lib/data/account";
import { mxn } from "@/lib/utils";
import { INDUSTRIAS } from "@/lib/constants";

export const metadata = { title: "Empresa y equipo" };

const ROL_LABEL: Record<string, { label: string; variant: any }> = {
  admin_empresa: { label: "Admin", variant: "default" },
  autorizador: { label: "Autorizador", variant: "purplecow" },
  comprador: { label: "Comprador", variant: "secondary" },
};

export default function PerfilPage() {
  const industria = INDUSTRIAS.find((i) => i.slug === CURRENT_COMPANY.industria)?.nombre;

  return (
    <div className="space-y-6">
      <PageHeader title="Empresa y equipo" description="Datos fiscales, crédito y control de accesos" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Datos empresa */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-steel-600" /> Datos de la empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Razón social" value={CURRENT_COMPANY.nombre} />
              <Field label="RFC" value={CURRENT_COMPANY.rfc} mono />
              <Field label="Industria" value={industria ?? "—"} />
              <Field label="Ciudad" value={CURRENT_COMPANY.ciudad} />
            </dl>
          </CardContent>
        </Card>

        {/* Crédito */}
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-emerald-600" /> Línea de crédito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-3xl font-bold text-steel-950">{mxn(CURRENT_COMPANY.limite_credito)}</p>
              <p className="text-sm text-steel-500">Límite preaprobado</p>
            </div>
            <Badge variant="success">
              <ShieldCheck className="size-3" /> Aprobado · {CURRENT_COMPANY.dias_credito} días
            </Badge>
            <p className="text-xs text-steel-500">
              Financiado por SOFOM partner. Amplía tu línea solicitando una revisión.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Equipo */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-steel-600" /> Equipo de compras
          </CardTitle>
          <Button variant="accent" size="sm">
            <Plus className="size-4" /> Invitar usuario
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-steel-50 text-left text-xs text-steel-500">
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Puesto</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Teléfono</th>
                  <th className="px-5 py-3 text-right font-medium">Límite sin autorización</th>
                </tr>
              </thead>
              <tbody>
                {TEAM.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-steel-50">
                    <td className="px-5 py-3 font-semibold text-steel-900">{u.nombre}</td>
                    <td className="px-5 py-3 text-steel-600">{u.puesto}</td>
                    <td className="px-5 py-3">
                      <Badge variant={ROL_LABEL[u.rol].variant}>{ROL_LABEL[u.rol].label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-steel-600">{u.telefono}</td>
                    <td className="px-5 py-3 text-right font-semibold text-steel-900">{mxn(u.limite_compra)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Flujo de aprobación (Amazon Business) */}
      <Card>
        <CardHeader>
          <CardTitle>Flujo de aprobación de compras</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {[
            { rango: "< $25,000 MXN", regla: "Auto-aprobada por el comprador", v: "success" },
            { rango: "$25,000 – $100,000", regla: "Requiere autorizador", v: "warning" },
            { rango: "> $100,000 MXN", regla: "Requiere admin de empresa", v: "danger" },
          ].map((r) => (
            <div key={r.rango} className="rounded-lg border p-4">
              <Badge variant={r.v as any} className="mb-2">{r.rango}</Badge>
              <p className="text-sm text-steel-700">{r.regla}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-steel-500">{label}</dt>
      <dd className={`mt-0.5 font-medium text-steel-900 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
