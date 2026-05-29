"use client";

import { useState } from "react";
import { Check, Loader2, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { mxn } from "@/lib/utils";
import { dispersarPago } from "@/app/(admin)/admin/actions";

export interface TreasuryRow {
  id: string;
  folio: string;
  proveedor: string;
  providerId: string;
  total: number;          // cobrar a la maquila
  payout: number;         // pagar al proveedor
  margen: number;         // margen Novak
  esCredito: boolean;
  cobrado: boolean;       // ¿la maquila ya pagó?
  dispersado: boolean;    // ¿ya le pagamos al proveedor?
}

export function TreasuryTable({ rows }: { rows: TreasuryRow[] }) {
  const { toast } = useToast();
  const [dispersados, setDispersados] = useState<string[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);

  async function dispersar(r: TreasuryRow) {
    setPayingId(r.id);
    const res = await dispersarPago({ orderId: r.id, providerId: r.providerId, monto: r.payout });
    setPayingId(null);
    if (res.ok) {
      setDispersados((d) => [...d, r.id]);
      toast({ type: "success", title: `Pago dispersado a ${r.proveedor}`, description: mxn(r.payout) + " vía SPEI" });
    } else {
      toast({ type: "error", title: "No se pudo dispersar", description: res.error });
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Conciliación por orden</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b bg-secondary/50 text-left text-xs text-ink-500">
                <th className="px-5 py-3 font-medium">Orden</th>
                <th className="px-5 py-3 font-medium">Proveedor</th>
                <th className="px-5 py-3 text-right font-medium">Cobrar maquila</th>
                <th className="px-5 py-3 text-right font-medium">Pagar proveedor</th>
                <th className="px-5 py-3 text-right font-medium">Margen Novak</th>
                <th className="px-5 py-3 font-medium">Cobranza</th>
                <th className="px-5 py-3 text-right font-medium">Dispersión</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const disp = r.dispersado || dispersados.includes(r.id);
                return (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-secondary/30">
                    <td className="px-5 py-3 font-mono font-semibold text-ink-900">{r.folio}</td>
                    <td className="px-5 py-3 text-ink-600">{r.proveedor}</td>
                    <td className="px-5 py-3 text-right font-medium text-ink-900">{mxn(r.total)}</td>
                    <td className="px-5 py-3 text-right text-ink-700">{mxn(r.payout)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-700">{mxn(r.margen)}</td>
                    <td className="px-5 py-3">
                      {r.cobrado ? <Badge variant="success">Cobrado</Badge> : r.esCredito ? <Badge variant="warning">A crédito</Badge> : <Badge variant="steel">Contado</Badge>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {disp ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><Check className="size-4" /> Dispersado</span>
                      ) : (
                        <Button size="sm" variant="gradient" disabled={payingId === r.id} onClick={() => dispersar(r)}>
                          {payingId === r.id ? <Loader2 className="size-4 animate-spin" /> : <><Banknote className="size-3.5" /> Dispersar</>}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
