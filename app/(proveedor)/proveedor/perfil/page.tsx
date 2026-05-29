import { Building2, ShieldCheck, Star, Crown, Banknote, Warehouse, Pencil } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProviderContext } from "@/lib/repos/provider-context";
import { REVENUE_STREAMS, FULFILLMENT_OPTIONS } from "@/lib/pricing/provider";
import { categoriaNombre } from "@/lib/constants";
import type { CategoriaMRO } from "@/types";

export const metadata = { title: "Mi cuenta" };

export default async function ProveedorPerfilPage() {
  const { provider: p } = await getProviderContext();

  return (
    <div className="space-y-6">
      <PageHeader title="Mi cuenta" description="Gestiona tu ficha, capacidades y datos de cobro">
        <Button variant="outline" size="sm"><Pencil className="size-4" /> Editar</Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="size-5 text-ink-600" /> Datos del negocio</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Razón social" value={p.razon_social} />
              <Field label="Nombre comercial" value={p.nombre_comercial} />
              <Field label="RFC" value={p.rfc} mono />
              <Field label="Ciudad" value={p.ciudad} />
              <Field label="Categorías" value={p.categorias.map((c) => categoriaNombre(c as CategoriaMRO)).join(", ")} />
              <Field label="Score" value={`⭐ ${p.score.toFixed(1)}`} />
            </dl>
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Certificaciones</p>
              <div className="flex flex-wrap gap-1.5">
                {p.certificaciones.map((c) => (
                  <Badge key={c} variant="steel"><ShieldCheck className="size-3" /> {c}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-safety/40 bg-safety-50/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Crown className="size-5 text-safety" /> Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="purplecow">Proveedor Fundador</Badge>
            <p className="font-display text-2xl font-extrabold text-ink-950">$0<span className="text-sm font-normal text-ink-500">/mes</span></p>
            <p className="text-xs text-ink-600">Sin cuota de entrada ni mensualidad. Solo comisión cuando vendes.</p>
            <div className="space-y-1.5 border-t pt-3">
              {REVENUE_STREAMS.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-ink-700"><r.icon className="size-3.5 text-safety" /> {r.nombre}</span>
                  <span className="font-mono font-semibold text-ink-900">{r.valor}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Warehouse className="size-5 text-ink-600" /> Cumplimiento</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {FULFILLMENT_OPTIONS.map((f) => (
              <div key={f.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{f.nombre}</p>
                  <p className="text-xs text-ink-500">{f.desc}</p>
                </div>
                <Badge variant={f.id === "dropshipping" ? "success" : "secondary"} className="shrink-0">
                  {f.id === "dropshipping" ? "Activo" : "Disponible"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Banknote className="size-5 text-ink-600" /> Cobro y crédito</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-800">
              <ShieldCheck className="mr-1 inline size-4" /> Novak te paga a ti. Le facturas a Novak; nosotros cobramos a la maquila.
            </div>
            <Field label="CLABE registrada" value="•••• •••• •••• ••3421" mono />
            <Field label="Plazo de pago a Novak" value="30 días" />
            <Field label="Acepta financiamiento Novak" value="Sí" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className={`mt-0.5 font-medium text-ink-900 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
