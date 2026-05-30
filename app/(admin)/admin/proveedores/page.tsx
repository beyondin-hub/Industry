import { Store, ShieldCheck, Star, Inbox } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderApprovals } from "@/components/admin/provider-approvals";
import { fetchProviders, fetchPendingProviders } from "@/lib/repos/providers";
import { categoriaNombre } from "@/lib/constants";
import type { CategoriaMRO } from "@/types";

export const metadata = { title: "Proveedores" };

export default async function AdminProveedoresPage() {
  const [activos, pendientes] = await Promise.all([fetchProviders(), fetchPendingProviders()]);
  const aprobados = activos.filter((p) => p.estado !== "pendiente");
  const confirmados = aprobados.filter((p) => p.stock_confirmado).length;
  const scoreProm = aprobados.length
    ? (aprobados.reduce((s, p) => s + p.score, 0) / aprobados.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <PageHeader title="Proveedores" description="Aprueba solicitudes, verifica certificaciones y monitorea el desempeño" />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Solicitudes pendientes" value={String(pendientes.length)} icon={Inbox} accent="text-safety" />
        <StatCard label="Proveedores aprobados" value={String(aprobados.length)} icon={Store} accent="text-emerald-600" />
        <StatCard label="Con stock confirmado" value={String(confirmados)} icon={ShieldCheck} accent="text-info" />
        <StatCard label="Score promedio" value={scoreProm} icon={Star} accent="text-gold" />
      </div>

      {/* Bandeja de aprobación */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Inbox className="size-5 text-safety" /> Solicitudes de alta
            {pendientes.length > 0 && <Badge variant="accent">{pendientes.length}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProviderApprovals pending={pendientes} />
        </CardContent>
      </Card>

      {/* Proveedores aprobados */}
      <Card>
        <CardHeader><CardTitle>Proveedores aprobados</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left text-xs text-ink-500">
                  <th className="px-5 py-3 font-medium">Proveedor</th>
                  <th className="px-5 py-3 font-medium">Ciudad</th>
                  <th className="px-5 py-3 font-medium">Categorías</th>
                  <th className="px-5 py-3 font-medium">Certificaciones</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {aprobados.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-secondary/30">
                    <td className="px-5 py-3 font-semibold text-ink-900">{p.nombre_comercial}</td>
                    <td className="px-5 py-3 text-ink-600">{p.ciudad}</td>
                    <td className="px-5 py-3 text-ink-600">{p.categorias.map((c) => categoriaNombre(c as CategoriaMRO)).join(", ")}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.certificaciones.map((c) => <Badge key={c} variant="steel" className="text-[10px]">{c}</Badge>)}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-ink-900">⭐ {p.score}</td>
                    <td className="px-5 py-3">
                      <Badge variant={p.stock_confirmado ? "success" : "warning"}>{p.stock_confirmado ? "Verificado" : "Por verificar"}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right"><Button variant="outline" size="sm">Ver</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
