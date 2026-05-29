"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ExportButton({
  rows,
  filename = "novak-gasto.csv",
}: {
  rows: { categoria: string; total: number; ordenes: number }[];
  filename?: string;
}) {
  const { toast } = useToast();

  function exportCSV() {
    const header = "Categoria,Total MXN,Ordenes\n";
    const body = rows.map((r) => `${r.categoria},${r.total},${r.ordenes}`).join("\n");
    const blob = new Blob(["﻿" + header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast({ type: "success", title: "Reporte exportado", description: "CSV listo para Excel / contabilidad." });
  }

  return (
    <Button variant="outline" size="sm" onClick={exportCSV}>
      <Download className="size-4" /> Exportar (CSV/Excel)
    </Button>
  );
}
