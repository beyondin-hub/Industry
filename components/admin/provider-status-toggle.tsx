"use client";

import { useState } from "react";
import { Loader2, Ban, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { approveProvider, rejectProvider } from "@/app/(admin)/admin/actions";

export function ProviderStatusToggle({ id, nombre, estadoInicial }: { id: string; nombre: string; estadoInicial?: string }) {
  const { toast } = useToast();
  const [estado, setEstado] = useState(estadoInicial ?? "aprobado");
  const [busy, setBusy] = useState(false);

  async function cambiar(suspender: boolean) {
    setBusy(true);
    const res = suspender ? await rejectProvider({ providerId: id }) : await approveProvider({ providerId: id });
    setBusy(false);
    if (res.ok) {
      setEstado(suspender ? "suspendido" : "aprobado");
      toast({ type: suspender ? "info" : "success", title: suspender ? `${nombre} suspendido` : `${nombre} reactivado` });
    } else toast({ type: "error", title: "No se pudo", description: res.error });
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={estado === "aprobado" ? "success" : estado === "pendiente" ? "warning" : "danger"}>{estado}</Badge>
      {estado === "suspendido" ? (
        <Button variant="gradient" size="sm" disabled={busy} onClick={() => cambiar(false)}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <><Check className="size-4" /> Reactivar</>}
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled={busy} onClick={() => cambiar(true)}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <><Ban className="size-4 text-danger" /> Suspender</>}
        </Button>
      )}
    </div>
  );
}
