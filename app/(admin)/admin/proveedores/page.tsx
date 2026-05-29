import { Store, ShieldCheck, Star } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROVIDERS } from "@/lib/data/providers";
import { categoriaNombre } from "@/lib/constants";
import type { CategoriaMRO } from "@/types";

export const metadata = { title: "Proveedores" };

export default function AdminProveedoresPage() {
  const activos = PROVIDERS.filter((p) => p.activo).length;
  const confirmados = PROVIDERS.filter((p) => p.stock_confirmado).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Proveedores" description="Alta, verificación de certificaciones y desempeño del marketplace" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Proveedores activos" value={String(activos)} icon={Store} accent="text-safety" />
        <StatCard label="Con stock confirmado" value={String(confirmados)} icon={ShieldCheck} accent="text-emerald-600" />
        <StatCard label="Score promedio" value={(PROVIDERS.reduce((s, p) => s + p.score, 0) / PROVIDERS.length).toFixed(1)} icon={Star} accent="text-gold" />
      </div>

      <Card>
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
                {PROVIDERS.map((p) => (
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
                    <td className="px-5 py-3 text-right">
                      <Button variant="outline" size="sm">Ver</Button>
                    </td>
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
