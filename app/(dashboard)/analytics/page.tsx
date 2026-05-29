import { TrendingUp, ShoppingCart, Package, Wallet, Sparkles, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/analytics/export-button";
import { SPEND_BY_CATEGORY, SPEND_BY_MONTH } from "@/lib/data/account";
import { PROVIDERS } from "@/lib/data/providers";
import { categoriaNombre, categoriaEmoji } from "@/lib/constants";
import { mxn, num } from "@/lib/utils";

export const metadata = { title: "Spend analytics" };

export default function AnalyticsPage() {
  const totalGasto = SPEND_BY_CATEGORY.reduce((s, c) => s + c.total, 0);
  const totalOrdenes = SPEND_BY_CATEGORY.reduce((s, c) => s + c.ordenes, 0);
  const maxCat = Math.max(...SPEND_BY_CATEGORY.map((c) => c.total));
  const maxMes = Math.max(...SPEND_BY_MONTH.map((m) => m.total));
  const topProviders = [...PROVIDERS].sort((a, b) => b.score - a.score).slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spend analytics"
        description="Visibilidad de gasto MRO de los últimos 6 meses · inteligencia para negociar mejor"
      >
        <ExportButton rows={SPEND_BY_CATEGORY.map((c) => ({ categoria: categoriaNombre(c.categoria as any), total: c.total, ordenes: c.ordenes }))} />
      </PageHeader>

      {/* Insights AI-powered */}
      <Card className="border-safety/30 bg-safety-50/40">
        <CardContent className="p-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Sparkles className="size-4 text-safety" /> Insights de tu gasto
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Compraste rodamientos 9 veces este semestre — un acuerdo de volumen te ahorraría ~$8,400 MXN.",
              "Tu gasto en EPP es el 30% del total; consolidarlo con un solo proveedor bajaría el precio ~12%.",
              "El gasto de mayo subió 12% vs. abril, impulsado por neumática. Revisa reorden automático.",
            ].map((t, i) => (
              <div key={i} className="flex gap-2 rounded-lg border bg-card p-3 text-sm text-ink-700">
                <Lightbulb className="size-4 shrink-0 text-gold" /> {t}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gasto total (6 meses)" value={mxn(totalGasto)} icon={Wallet} accent="text-emerald-600" />
        <StatCard label="Órdenes" value={num(totalOrdenes)} icon={ShoppingCart} accent="text-safety" />
        <StatCard label="Ticket promedio" value={mxn(totalGasto / totalOrdenes)} icon={TrendingUp} accent="text-purplecow" />
        <StatCard label="Categorías activas" value={String(SPEND_BY_CATEGORY.length)} icon={Package} accent="text-steel-700" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Gasto por categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SPEND_BY_CATEGORY.map((c) => (
              <div key={c.categoria}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-steel-800">
                    {categoriaEmoji(c.categoria as any)} {categoriaNombre(c.categoria as any)}
                  </span>
                  <span className="text-steel-600">{mxn(c.total)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-steel-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-steel-600 to-safety"
                    style={{ width: `${(c.total / maxCat) * 100}%` }}
                  />
                </div>
                <p className="mt-0.5 text-xs text-steel-400">{c.ordenes} órdenes</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Por mes */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-end justify-between gap-3 pt-4">
              {SPEND_BY_MONTH.map((m) => (
                <div key={m.mes} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-steel-600">
                    ${Math.round(m.total / 1000)}k
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-steel-800 to-steel-500 transition-all hover:from-safety hover:to-safety-400"
                    style={{ height: `${(m.total / maxMes) * 100}%` }}
                  />
                  <span className="text-xs text-steel-500">{m.mes}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top proveedores */}
      <Card>
        <CardHeader>
          <CardTitle>Proveedores principales</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b bg-steel-50 text-left text-xs text-steel-500">
                  <th className="px-5 py-3 font-medium">Proveedor</th>
                  <th className="px-5 py-3 font-medium">Ciudad</th>
                  <th className="px-5 py-3 font-medium">Certificaciones</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                </tr>
              </thead>
              <tbody>
                {topProviders.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-steel-50">
                    <td className="px-5 py-3 font-semibold text-steel-900">{p.nombre_comercial}</td>
                    <td className="px-5 py-3 text-steel-600">{p.ciudad}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.certificaciones.map((c) => (
                          <Badge key={c} variant="steel" className="text-[10px]">{c}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-steel-900">⭐ {p.score}</td>
                    <td className="px-5 py-3"><Badge variant="accent" className="capitalize">{p.plan_membresia}</Badge></td>
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
