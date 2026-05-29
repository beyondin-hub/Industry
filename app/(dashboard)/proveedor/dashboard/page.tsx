import {
  Store,
  FileSpreadsheet,
  TrendingUp,
  Package,
  Star,
  Send,
  Crown,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UrgenciaBadge } from "@/components/shared/status-badge";
import { RFQS } from "@/lib/data/account";
import { PRODUCTS } from "@/lib/data/products";
import { getProvider } from "@/lib/data/providers";
import { mxn, tiempoRestante, num } from "@/lib/utils";

export const metadata = { title: "Portal de proveedor" };

export default function ProveedorDashboard() {
  // Proveedor demo: RodaNorte
  const prov = getProvider("prov-001")!;
  const misProductos = PRODUCTS.filter((p) => p.provider_id === prov.id);
  const rfqsAbiertos = RFQS.filter((r) => r.estado !== "cerrado");

  return (
    <div className="space-y-6">
      <PageHeader
        title={prov.nombre_comercial}
        description={`Portal de proveedor · ${prov.ciudad}`}
      >
        <Badge variant="purplecow" className="capitalize">
          <Crown className="size-3" /> Plan {prov.plan_membresia}
        </Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="RFQ por cotizar" value={String(rfqsAbiertos.length)} icon={FileSpreadsheet} accent="text-safety" />
        <StatCard label="Productos en catálogo" value={String(misProductos.length)} icon={Package} accent="text-steel-700" />
        <StatCard label="Ventas del mes" value={mxn(284500)} hint="+18% vs. mes anterior" icon={TrendingUp} accent="text-emerald-600" />
        <StatCard label="Score" value={`${prov.score} ⭐`} hint="Tasa respuesta 96%" icon={Star} accent="text-amber-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* RFQ entrantes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-safety" /> Solicitudes de cotización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rfqsAbiertos.map((rfq) => {
              const t = tiempoRestante(rfq.deadline_cotizacion);
              return (
                <div key={rfq.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-steel-900">{rfq.folio}</span>
                      <UrgenciaBadge urgencia={rfq.urgencia} />
                    </div>
                    <Badge variant={t.vencido ? "danger" : "purplecow"}>
                      SLA: {t.vencido ? "vencido" : t.label}
                    </Badge>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-steel-600">
                    {rfq.items.map((it) => (
                      <li key={it.id}>
                        • {num(it.cantidad)} {it.unidad} — {it.descripcion}
                        {it.certificacion_requerida && (
                          <Badge variant="steel" className="ml-1 text-[10px]">{it.certificacion_requerida}</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-steel-500">Pago: {rfq.condicion_pago === "contado" ? "contado" : `${rfq.condicion_pago} días`}</span>
                    <Button variant="accent" size="sm">
                      <Send className="size-3.5" /> Enviar cotización
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Membresía */}
        <Card>
          <CardHeader>
            <CardTitle>Tu membresía</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { plan: "Básico", precio: "$2,500", features: ["Hasta 50 productos", "RFQ ilimitados"], active: false },
              { plan: "Premium", precio: "$5,000", features: ["Hasta 300 productos", "Badge destacado", "Prioridad en RFQ"], active: false },
              { plan: "Enterprise", precio: "$8,000", features: ["Productos ilimitados", "API e integración", "Account manager"], active: true },
            ].map((m) => (
              <div
                key={m.plan}
                className={`rounded-lg border p-3 ${m.active ? "border-purplecow bg-purplecow-50" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-steel-900">{m.plan}</span>
                  <span className="text-sm font-bold text-steel-900">{m.precio}<span className="text-xs font-normal text-steel-500">/mes</span></span>
                </div>
                <ul className="mt-1.5 space-y-0.5 text-xs text-steel-600">
                  {m.features.map((f) => <li key={f}>✓ {f}</li>)}
                </ul>
                {m.active && <Badge variant="purplecow" className="mt-2">Plan actual</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Mis productos */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="size-5 text-steel-600" /> Mi catálogo
          </CardTitle>
          <Button variant="outline" size="sm"><Package className="size-4" /> Agregar producto</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-steel-50 text-left text-xs text-steel-500">
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">N/P</th>
                  <th className="px-5 py-3 text-right font-medium">Precio base</th>
                  <th className="px-5 py-3 text-right font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {misProductos.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-steel-50">
                    <td className="px-5 py-3 font-medium text-steel-900">{p.nombre}</td>
                    <td className="px-5 py-3 font-mono text-steel-600">{p.numero_parte}</td>
                    <td className="px-5 py-3 text-right font-semibold text-steel-900">{mxn(p.precio_base)}</td>
                    <td className="px-5 py-3 text-right text-steel-600">{num(p.stock_actual)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={p.stock_actual > 0 ? "success" : "warning"}>
                        {p.stock_actual > 0 ? "En stock" : "Sin stock"}
                      </Badge>
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
