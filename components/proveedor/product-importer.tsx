"use client";

import { useState } from "react";
import {
  Sparkles, Upload, Wand2, Plus, Trash2, Check, Loader2, FileText, Pencil, CircleAlert,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CATEGORIAS, categoriaNombre } from "@/lib/constants";
import { publishProducts } from "@/app/(dashboard)/proveedor/actions";
import { cn } from "@/lib/utils";

interface Draft {
  nombre: string;
  numero_parte: string;
  marca: string;
  categoria: string;
  unidad: string;
  precio: number;
  descripcion: string;
  certificaciones: string[];
  confianza?: string;
}

const EJEMPLO = `Balero 6205-2RS SKF sellado
Grasa multipropósito EP2 Mobil 400g
Guante nitrilo Ansell talla 9
Sensor inductivo M18 Omron PNP
Disco de corte 4-1/2 Norton metal`;

export function ProductImporter() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"ia" | "manual">("ia");
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [enrichedBy, setEnrichedBy] = useState<string>("");

  async function enrich() {
    if (!raw.trim()) {
      toast({ type: "error", title: "Pega tu lista o sube un archivo primero" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/enrich-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw }),
      });
      const data = await res.json();
      const items: Draft[] = (data.products ?? []).map((p: any) => ({
        nombre: p.nombre ?? "",
        numero_parte: p.numero_parte ?? "",
        marca: p.marca ?? "",
        categoria: p.categoria ?? "herramientas",
        unidad: p.unidad ?? "pza",
        precio: Number(p.precio ?? p.precio_base ?? 0),
        descripcion: p.descripcion ?? "",
        certificaciones: p.certificaciones ?? [],
        confianza: p.confianza,
      }));
      setDrafts((d) => [...items, ...d]);
      setEnrichedBy(data.enriched_by ?? "");
      setRaw("");
      toast({
        type: "success",
        title: `${items.length} productos enriquecidos con IA`,
        description: data.enriched_by === "claude" ? "Completados por Novak IA. Revisa y publica." : "Fichas generadas. Revisa y completa precios.",
      });
    } catch {
      toast({ type: "error", title: "No se pudo procesar", description: "Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  }

  function update(i: number, patch: Partial<Draft>) {
    setDrafts((d) => d.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function remove(i: number) {
    setDrafts((d) => d.filter((_, idx) => idx !== i));
  }
  function addManual() {
    setDrafts((d) => [{ nombre: "", numero_parte: "", marca: "", categoria: "herramientas", unidad: "pza", precio: 0, descripcion: "", certificaciones: [] }, ...d]);
    setTab("manual");
  }
  async function handleFile(f: File) {
    if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
      setLoading(true);
      try {
        const fd = new FormData();
        fd.append("file", f);
        const res = await fetch("/api/parse-pdf", { method: "POST", body: fd });
        const data = await res.json();
        if (data.text) {
          setRaw(data.text);
          toast({ type: "success", title: `PDF leído (${data.lineas} líneas)`, description: "Pulsa “Enriquecer con IA” para completar las fichas." });
        } else {
          toast({ type: "error", title: "No se pudo leer el PDF", description: data.error });
        }
      } catch {
        toast({ type: "error", title: "No se pudo leer el PDF" });
      } finally {
        setLoading(false);
      }
    } else {
      f.text().then(setRaw);
    }
  }

  const [publishing, setPublishing] = useState(false);
  async function publish() {
    const validos = drafts.filter((d) => d.nombre.trim().length > 2 && d.precio > 0);
    if (validos.length === 0) {
      toast({ type: "error", title: "Agrega nombre y precio a tus productos" });
      return;
    }
    setPublishing(true);
    const res = await publishProducts(validos.map((d) => ({
      nombre: d.nombre, numero_parte: d.numero_parte, marca: d.marca, categoria: d.categoria,
      unidad: d.unidad, precio: d.precio, descripcion: d.descripcion, certificaciones: d.certificaciones,
    })));
    setPublishing(false);
    if (res.ok) {
      toast({
        type: "success",
        title: `${res.publicados} productos publicados`,
        description: res.persisted ? "Guardados en Supabase y visibles en el catálogo." : "Visibles en el catálogo de Novak (demo).",
      });
      setDrafts([]);
    } else {
      toast({ type: "error", title: "No se pudieron publicar", description: res.error });
    }
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab("ia")} className={cn("flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium", tab === "ia" ? "bg-ink-950 text-white" : "border text-ink-600 hover:bg-secondary")}>
          <Sparkles className="size-4" /> Importar con IA
        </button>
        <button onClick={() => setTab("manual")} className={cn("flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium", tab === "manual" ? "bg-ink-950 text-white" : "border text-ink-600 hover:bg-secondary")}>
          <Pencil className="size-4" /> Manual (1 a 1)
        </button>
      </div>

      {tab === "ia" && (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <Wand2 className="size-5 text-safety" />
            <h3 className="font-display font-semibold text-ink-900">Pega tu catálogo y deja que Novak lo complete</h3>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Pega tu lista (un producto por línea), o sube un CSV/TXT. La IA detecta marca,
            número de parte, categoría y completa la ficha técnica. Tú solo validas y pones precio.
          </p>
          <Textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={6} className="mt-3 font-mono" placeholder={EJEMPLO} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="gradient" onClick={enrich} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <><Sparkles className="size-4" /> Enriquecer con IA</>}
            </Button>
            <label className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}>
              <Upload className="size-4" /> Subir PDF / CSV / TXT
              <input type="file" accept=".csv,.txt,.pdf,text/plain,text/csv,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </label>
            <button onClick={() => setRaw(EJEMPLO)} className="text-xs font-medium text-safety hover:underline">Usar ejemplo</button>
          </div>
        </div>
      )}

      {tab === "manual" && (
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-ink-600">Agrega productos uno por uno. Se suman a la lista de revisión de abajo.</p>
          <Button variant="outline" className="mt-3" onClick={addManual}><Plus className="size-4" /> Agregar producto en blanco</Button>
        </div>
      )}

      {/* Revisión */}
      {drafts.length > 0 && (
        <div className="rounded-xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
            <p className="flex items-center gap-2 font-display font-semibold text-ink-900">
              Revisión ({drafts.length})
              {enrichedBy === "claude" && <Badge variant="purplecow" className="text-[10px]"><Sparkles className="size-2.5" /> Completado por Novak IA</Badge>}
              {enrichedBy === "heuristica" && <Badge variant="secondary" className="text-[10px]">Autocompletado</Badge>}
            </p>
            <Button variant="gradient" onClick={publish} disabled={publishing}>
              {publishing ? <Loader2 className="size-4 animate-spin" /> : <><Check className="size-4" /> Publicar productos</>}
            </Button>
          </div>
          <div className="divide-y">
            {drafts.map((d, i) => (
              <div key={i} className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <Label className="mb-1 block text-[11px]">Nombre</Label>
                      <Input value={d.nombre} onChange={(e) => update(i, { nombre: e.target.value })} placeholder="Nombre del producto" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="mb-1 block text-[11px]">N/P</Label>
                        <Input value={d.numero_parte} onChange={(e) => update(i, { numero_parte: e.target.value })} className="font-mono" />
                      </div>
                      <div>
                        <Label className="mb-1 block text-[11px]">Marca</Label>
                        <Input value={d.marca} onChange={(e) => update(i, { marca: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="mb-1 block text-[11px]">Categoría</Label>
                      <Select value={d.categoria} onChange={(e) => update(i, { categoria: e.target.value })}>
                        {CATEGORIAS.map((c) => <option key={c.slug} value={c.slug}>{categoriaNombre(c.slug)}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-1 block text-[11px]">Precio (MXN)</Label>
                      <Input type="number" min={0} value={d.precio || ""} onChange={(e) => update(i, { precio: Number(e.target.value) })} placeholder="0.00" />
                    </div>
                    <div>
                      <Label className="mb-1 block text-[11px]">Unidad</Label>
                      <Select value={d.unidad} onChange={(e) => update(i, { unidad: e.target.value })}>
                        <option value="pza">pza</option><option value="par">par</option><option value="caja">caja</option><option value="kit">kit</option><option value="galón">galón</option>
                      </Select>
                    </div>
                  </div>
                  <Input value={d.descripcion} onChange={(e) => update(i, { descripcion: e.target.value })} placeholder="Descripción" />
                </div>
                <div className="flex flex-row items-start justify-between gap-2 md:flex-col md:items-end">
                  {d.precio <= 0 ? (
                    <Badge variant="warning" className="text-[10px]"><CircleAlert className="size-2.5" /> Falta precio</Badge>
                  ) : (
                    <Badge variant="success" className="text-[10px]"><Check className="size-2.5" /> Listo</Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => remove(i)} aria-label="Eliminar"><Trash2 className="size-4 text-danger" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
