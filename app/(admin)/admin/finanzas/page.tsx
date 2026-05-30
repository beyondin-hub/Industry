import { TrendingUp, Percent, Landmark, Filter } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendChart } from "@/components/dashboard/spend-chart";
import { SPEND_BY_MONTH, SPEND_BY_CATEGORY, ORDERS, RFQS } from "@/lib/data/account";
import { BUYER_COMPANIES } from "@/lib/data/admin";
import { COMISION, creditExposure } from "@/lib/credit/engine";
import { categoriaNombre, categoriaEmoji } from "@/lib/constants";
import { mxn } from "@/lib/utils";
import type { CategoriaMRO } from "@/types";

export const metadata = { title: "Finanzas y analytics" };

export default function FinanzasPage() {
  const gmv = SPEND_BY_MONTH.reduce((s, m) => s + m.total, 0);
  const margen = Math.round(gmv - gmv / (1 + COMISION));
  const exposicion = creditExposure(ORDERS as any) + BUYER_COMPANIES.reduce((s, c) => s + c.exposicion, 0);
  const totalRfq = RFQS.length;
  const ordenes = ORDERS.length;
  const conversion = totalRfq ? Math.round((ordenes / totalRfq) * 100) : 0;

  const maxCat = Math.max(...SPEND_BY_CATEGORY.map((c) => c.total));
  // Embudo
  const cotizados = RFQS.filter((r) => r.estado === "cotizado" || r.estado === "aprobado" || r.estado === "cerrado").length;
  const funnel = [
    { label: "RFQ recibidos", v: totalRfq },
    { label: "Cotizados", v: cotizados },
    { label: "Órdenes", v: ordenes },
  ];
  const maxF = Math.max(...funnel.map((f) => f.v), 1);
  // Por ciudad
  const ciudades = Object.entries(
    BUYER_COMPANIES.reduce((acc, c) => { acc[c.ciudad] = (acc[c.ciudad] ?? 0) + c.gmv6m; return acc; }, {} as Record<string, number>),
  ).sort((a, b) => b[1] - a[1]);
  const maxCiudad = Math.max(...ciudades.map(([, v]) => v), 1);

  return (
    <div className="space-y-6">
      <PageHeader title="Finanzas y analytics" description="Salud financiera del marketplace: GMV, margen, crédito y embudo" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="GMV (6 meses)" value={mxn(gmv)} icon={TrendingUp} accent="text-emerald-600" />
        <StatCard label="Margen Novak" value={mxn(margen)} hint="comisión acumulada" icon={Percent} accent="text-safety" />
        <StatCard label="Exposición de crédito" value={mxn(exposicion)} icon={Landmark} accent="text-info" />
        <StatCard label="Conversión RFQ→Orden" value={`${conversion}%`} icon={Filter} accent="text-purplecow" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>GMV mensual</CardTitle></CardHeader>
          <CardContent><SpendChart data={SPEND_BY_MONTH} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Embudo</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-2">
            {funnel.map((f) => (
              <div key={f.label}>
                <div className="mb-1 flex items-center justify-between text-sm"><span className="text-ink-700">{f.label}</span><span className="font-semibold text-ink-900">{f.v}</span></div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100"><div className="h-full gradient-accent" style={{ width: `${(f.v / maxF) * 100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Gasto por categoría</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {SPEND_BY_CATEGORY.map((c) => (
              <div key={c.categoria}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-ink-800">{categoriaEmoji(c.categoria as CategoriaMRO)} {categoriaNombre(c.categoria as CategoriaMRO)}</span>
                  <span className="text-ink-600">{mxn(c.total)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-gradient-to-r from-ink-600 to-safety" style={{ width: `${(c.total / maxCat) * 100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>GMV por ciudad</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {ciudades.map(([ciudad, v]) => (
              <div key={ciudad}>
                <div className="mb-1 flex items-center justify-between text-sm"><span className="text-ink-800">{ciudad}</span><span className="text-ink-600">{mxn(v)}</span></div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100"><div className="h-full gradient-accent" style={{ width: `${(v / maxCiudad) * 100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
