"use client";

import { useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { mxn, num } from "@/lib/utils";
import { setProductActive } from "@/app/(admin)/admin/catalogo/actions";

export interface ProductModVM {
  id: string; nombre: string; numero_parte: string; marca: string; proveedor: string;
  categoria: string; precio: number; stock: number; activo: boolean;
}

export function CatalogModeration({ products }: { products: ProductModVM[] }) {
  const { toast } = useToast();
  const [rows, setRows] = useState(products);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const visibles = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((p) => `${p.nombre} ${p.numero_parte} ${p.marca} ${p.proveedor}`.toLowerCase().includes(s));
  }, [rows, q]);

  async function toggle(p: ProductModVM) {
    setBusy(p.id);
    const activo = !p.activo;
    const res = await setProductActive({ productId: p.id, nombre: p.nombre, activo });
    setBusy(null);
    if (res.ok) {
      setRows((a) => a.map((x) => (x.id === p.id ? { ...x, activo } : x)));
      toast({ type: activo ? "success" : "info", title: activo ? "Producto publicado" : "Producto despublicado", description: p.nombre });
    } else toast({ type: "error", title: "No se pudo", description: res.error });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border bg-card p-2 shadow-sm">
        <Search className="ml-2 size-5 text-ink-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, N/P, marca o proveedor…" className="h-9 flex-1 bg-transparent text-sm outline-none" />
        <span className="pr-2 text-xs text-ink-500">{visibles.length} productos</span>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left text-xs text-ink-500">
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">Proveedor</th>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 text-right font-medium">Precio</th>
                  <th className="px-5 py-3 text-right font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 text-right font-medium">Moderar</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-secondary/30">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink-900">{p.nombre}</p>
                      <p className="font-mono text-[11px] text-ink-400">{p.marca} · {p.numero_parte}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-700">{p.proveedor}</td>
                    <td className="px-5 py-3 text-ink-600">{p.categoria}</td>
                    <td className="px-5 py-3 text-right font-semibold text-ink-900">{mxn(p.precio)}</td>
                    <td className="px-5 py-3 text-right text-ink-600">{num(p.stock)}</td>
                    <td className="px-5 py-3"><Badge variant={p.activo ? "success" : "secondary"}>{p.activo ? "Publicado" : "Oculto"}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="outline" size="sm" disabled={busy === p.id} onClick={() => toggle(p)}>
                        {busy === p.id ? <Loader2 className="size-4 animate-spin" /> : p.activo ? "Despublicar" : "Publicar"}
                      </Button>
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
