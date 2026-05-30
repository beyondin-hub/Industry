import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Star, Package, ShieldCheck, Banknote, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProviderStatusToggle } from "@/components/admin/provider-status-toggle";
import { fetchProvider } from "@/lib/repos/providers";
import { fetchProductsByProvider } from "@/lib/repos/products";
import { categoriaNombre } from "@/lib/constants";
import { mxn, num } from "@/lib/utils";
import type { CategoriaMRO } from "@/types";

export const metadata = { title: "Proveedor" };

export default async function ProveedorDetallePage({ params }: { params: { id: string } }) {
  const prov = await fetchProvider(params.id);
  if (!prov) notFound();
  const productos = await fetchProductsByProvider(prov.id);
  const ventas = Math.round(prov.score * 62000); // demo
  const payouts = Math.round(ventas * 0.77);

  return (
    <div className="space-y-6">
      <Link href="/admin/proveedores" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-safety">
        <ChevronLeft className="size-4" /> Proveedores
      </Link>

      <PageHeader title={prov.nombre_comercial} description={prov.razon_social}>
        <ProviderStatusToggle id={prov.id} nombre={prov.nombre_comercial} estadoInicial={prov.estado} />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Productos publicados" value={String(productos.length)} icon={Package} accent="text-safety" />
        <StatCard label="Ventas (6m)" value={mxn(ventas)} icon={TrendingUp} accent="text-emerald-600" />
        <StatCard label="Pagado al proveedor" value={mxn(payouts)} icon={Banknote} accent="text-info" />
        <StatCard label="Score" value={`${prov.score} ⭐`} icon={Star} accent="text-gold" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Catálogo del proveedor</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b bg-secondary/50 text-left text-xs text-ink-500">
                    <th className="px-5 py-3 font-medium">Producto</th>
                    <th className="px-5 py-3 font-medium">N/P</th>
                    <th className="px-5 py-3 text-right font-medium">Precio</th>
                    <th className="px-5 py-3 text-right font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-ink-500">Sin productos publicados aún.</td></tr>
                  )}
                  {productos.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-5 py-3 font-medium text-ink-900">{p.nombre}</td>
                      <td className="px-5 py-3 font-mono text-ink-600">{p.numero_parte}</td>
                      <td className="px-5 py-3 text-right font-semibold text-ink-900">{mxn(p.precio_base)}</td>
                      <td className="px-5 py-3 text-right text-ink-600">{num(p.stock_actual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-emerald-600" /> Certificaciones</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {prov.certificaciones.map((c) => (
                <div key={c} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span className="font-medium text-ink-900">{c}</span>
                  <Badge variant="success">Vigente · exp. 2027</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Ficha</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-1.5 text-ink-600"><MapPin className="size-4" /> {prov.ciudad}</p>
              <p className="font-mono text-xs text-ink-500">RFC: {prov.rfc}</p>
              <p className="text-ink-600">Categorías: {prov.categorias.map((c) => categoriaNombre(c as CategoriaMRO)).join(", ")}</p>
              <p className="text-ink-600 capitalize">Plan: {prov.plan_membresia}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
