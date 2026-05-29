"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Upload, Trash2, Plus, FileSpreadsheet, ScanBarcode, ImagePlus,
  ChevronLeft, ChevronRight, CheckCircle2, Zap, Download, MessageCircle,
  ShieldCheck, Loader2, Check,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/rfq/countdown";
import { useToast } from "@/components/ui/toast";
import { PRODUCTS, getProduct } from "@/lib/data/products";
import { CERTIFICACIONES, CIUDADES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CondicionPago, Urgencia } from "@/types";

interface Item {
  descripcion: string;
  numero_parte: string;
  cantidad: number;
  unidad: string;
  imagen?: string;
}
type Tipo = "especifico" | "lista" | "desconocido";

const STEPS = ["Necesidad", "Especificaciones", "Comercial", "Confirmación"];

export function RFQWizard({
  presetSku,
  presetQty,
  company,
}: {
  presetSku?: string;
  presetQty?: number;
  company: { nombre: string; rfc: string; ciudad: string };
}) {
  const { toast } = useToast();
  const preset = presetSku ? getProduct(presetSku) : undefined;
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState(0);
  const [tipo, setTipo] = useState<Tipo>(preset ? "especifico" : "especifico");
  const [items, setItems] = useState<Item[]>(
    preset
      ? [{ descripcion: preset.nombre, numero_parte: preset.numero_parte, cantidad: presetQty ?? 1, unidad: preset.unidad }]
      : [],
  );
  const [urgencia, setUrgencia] = useState<Urgencia>("normal");

  // Paso 2
  const [certs, setCerts] = useState<string[]>([]);
  const [marca, setMarca] = useState("");
  const [norma, setNorma] = useState("");
  const [notas, setNotas] = useState("");
  const [fichaTecnica, setFichaTecnica] = useState(false);
  const [visitaTecnica, setVisitaTecnica] = useState(false);

  // Paso 3
  const [direccion, setDireccion] = useState(`Planta ${company.ciudad}`);
  const [pago, setPago] = useState<CondicionPago>("60");
  const [cfdi, setCfdi] = useState(true);
  const [rfc, setRfc] = useState(company.rfc);
  const [presupuesto, setPresupuesto] = useState("");
  const [recurrente, setRecurrente] = useState(false);
  const [frecuencia, setFrecuencia] = useState("30");

  // Resultado
  const [result, setResult] = useState<{ folio: string; deadline: string } | null>(null);
  const [canales, setCanales] = useState<string[]>(["whatsapp", "email"]);

  // Buscador catálogo (autocomplete demo)
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter((p) =>
      `${p.nombre} ${p.numero_parte} ${p.marca}`.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [query]);

  function addItem(it: Item) {
    setItems((a) => [...a, it]);
  }
  function updateItem(i: number, patch: Partial<Item>) {
    setItems((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function removeItem(i: number) {
    setItems((a) => a.filter((_, idx) => idx !== i));
  }

  function parseCSV(text: string) {
    const rows = text.split(/\r?\n/).filter(Boolean);
    const start = /parte|sku|descrip/i.test(rows[0] ?? "") ? 1 : 0;
    const parsed: Item[] = [];
    for (const row of rows.slice(start)) {
      const [np, desc, cant, uni] = row.split(",").map((s) => s.trim());
      if (!np && !desc) continue;
      parsed.push({
        numero_parte: np ?? "",
        descripcion: desc || np || "Sin descripción",
        cantidad: Math.max(1, Number(cant) || 1),
        unidad: uni || "pza",
      });
    }
    if (parsed.length) {
      setItems((a) => [...a, ...parsed]);
      toast({ type: "success", title: `${parsed.length} partidas importadas`, description: "Revisa y ajusta cantidades." });
    } else {
      toast({ type: "error", title: "No pudimos leer el archivo", description: "Usa la plantilla CSV." });
    }
  }

  const templateHref =
    "data:text/csv;charset=utf-8," +
    encodeURIComponent("Numero de Parte,Descripcion,Cantidad,Unidad\n6205-2RS,Balero de bolas,50,pza\nGR-EP2-400,Grasa EP2 400g,24,pza\n");

  function canContinue() {
    if (step === 0) return items.length > 0;
    return true;
  }

  function submit() {
    const specs: string[] = [];
    if (certs.length) specs.push(`Certificaciones: ${certs.join(", ")}`);
    if (marca) specs.push(`Marca preferida: ${marca}`);
    if (norma) specs.push(`Norma: ${norma}`);
    if (fichaTecnica) specs.push("Requiere ficha técnica del proveedor");
    if (visitaTecnica) specs.push("Requiere visita técnica previa");
    specs.push(`Entrega: ${direccion}`);
    if (presupuesto) specs.push(`Presupuesto máx: ${presupuesto}`);
    if (recurrente) specs.push(`Compra recurrente cada ${frecuencia} días`);
    if (notas) specs.push(`Notas: ${notas}`);

    startTransition(async () => {
      try {
        const res = await fetch("/api/rfq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((it) => ({
              descripcion: it.descripcion,
              numero_parte: it.numero_parte,
              cantidad: it.cantidad,
              unidad: it.unidad,
              certificacion: certs[0],
            })),
            urgencia,
            condicion_pago: pago,
            requiere_cfdi: cfdi,
            notas: specs.join(" · "),
          }),
        });
        const data = await res.json();
        // Contador visible al comprador: la promesa de 2h desde el envío.
        // (La BD conserva data.deadline_cotizacion en horas hábiles para operaciones.)
        const displayDeadline = new Date(Date.now() + 2 * 3_600_000).toISOString();
        setResult({ folio: data.folio, deadline: displayDeadline });
        setStep(3);
        toast({ type: "success", title: `RFQ ${data.folio} enviado`, description: "Cotización en menos de 2h hábiles." });
      } catch {
        toast({ type: "error", title: "No se pudo enviar", description: "Intenta de nuevo o escríbenos por WhatsApp." });
      }
    });
  }

  // ─── Render ───
  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress bar */}
      {!result && (
        <div className="mb-8">
          <div className="mb-3 flex justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    i < step ? "gradient-accent text-white" : i === step ? "bg-ink-950 text-white" : "bg-secondary text-ink-400",
                  )}
                >
                  {i < step ? <Check className="size-4" /> : i + 1}
                </div>
                <span className={cn("text-[11px]", i <= step ? "font-medium text-ink-800" : "text-ink-400")}>{s}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full gradient-accent"
              initial={false}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={result ? "done" : step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          {/* PASO 1 */}
          {!result && step === 0 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-ink-950">¿Qué necesitas?</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {([
                  { k: "especifico", t: "Producto específico", d: "Sé qué necesito", icon: ScanBarcode },
                  { k: "lista", t: "Lista de productos", d: "Subir Excel/CSV", icon: FileSpreadsheet },
                  { k: "desconocido", t: "No sé el N/P", d: "Describir o foto", icon: ImagePlus },
                ] as const).map((o) => (
                  <button
                    key={o.k}
                    onClick={() => setTipo(o.k)}
                    className={cn(
                      "rounded-xl border-2 p-4 text-left transition-colors",
                      tipo === o.k ? "border-safety bg-safety-50" : "border-border hover:border-ink-300",
                    )}
                  >
                    <o.icon className={cn("size-5", tipo === o.k ? "text-safety" : "text-ink-500")} />
                    <p className="mt-2 text-sm font-semibold text-ink-900">{o.t}</p>
                    <p className="text-[11px] text-ink-500">{o.d}</p>
                  </button>
                ))}
              </div>

              {tipo === "especifico" && (
                <div className="rounded-xl border bg-card p-4">
                  <Label className="mb-1.5 block">Busca o pega el número de parte</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ej. 6205-2RS, grasa EP2, sensor M18…"
                      className="pl-9 font-mono"
                    />
                    {matches.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border bg-card shadow-lg">
                        {matches.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              addItem({ descripcion: p.nombre, numero_parte: p.numero_parte, cantidad: 1, unidad: p.unidad });
                              setQuery("");
                            }}
                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-secondary"
                          >
                            <span className="truncate">{p.nombre}</span>
                            <span className="shrink-0 font-mono text-xs text-ink-400">{p.numero_parte}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tipo === "lista" && (
                <div className="rounded-xl border border-dashed bg-card p-6 text-center">
                  <label className="flex cursor-pointer flex-col items-center gap-2">
                    <Upload className="size-7 text-ink-400" />
                    <span className="text-sm font-medium text-ink-800">Sube tu CSV de SKUs y cantidades</span>
                    <span className="text-xs text-ink-500">Columnas: Número de Parte, Descripción, Cantidad, Unidad</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) f.text().then(parseCSV);
                      }}
                    />
                    <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-1")}>Elegir archivo</span>
                  </label>
                  <a href={templateHref} download="plantilla-mrolink.csv" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-safety hover:underline">
                    <Download className="size-3.5" /> Descargar plantilla
                  </a>
                </div>
              )}

              {tipo === "desconocido" && (
                <DesconocidoForm onAdd={addItem} />
              )}

              {/* Lista de items */}
              {items.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-ink-700">Partidas ({items.length})</p>
                  {items.map((it, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border bg-card p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-900">{it.descripcion}</p>
                        {it.numero_parte && <p className="font-mono text-xs text-ink-400">{it.numero_parte}</p>}
                      </div>
                      <Input
                        type="number"
                        min={1}
                        value={it.cantidad}
                        onChange={(e) => updateItem(i, { cantidad: Math.max(1, Number(e.target.value) || 1) })}
                        className="h-9 w-20"
                      />
                      <span className="w-10 text-xs text-ink-500">{it.unidad}</span>
                      <button onClick={() => removeItem(i)} className="text-danger hover:opacity-70" aria-label="Eliminar">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label className="mb-1.5 block">¿Es urgente?</Label>
                <Select value={urgencia} onChange={(e) => setUrgencia(e.target.value as Urgencia)}>
                  <option value="urgente_24h">🔴 Urgente — necesito en 24h</option>
                  <option value="normal">Normal — 2-3 días</option>
                  <option value="programado">Programado — fecha futura</option>
                </Select>
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {!result && step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-ink-950">Especificaciones técnicas</h2>
              <div>
                <Label className="mb-2 block">Certificación requerida</Label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICACIONES.map((c) => {
                    const on = certs.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => setCerts((a) => (on ? a.filter((x) => x !== c) : [...a, c]))}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          on ? "border-safety bg-safety-50 text-safety" : "border-border text-ink-600 hover:border-ink-300",
                        )}
                      >
                        {on && <Check className="mr-1 inline size-3" />}{c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block">Marca preferida</Label>
                  <Input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Sin preferencia" />
                </div>
                <div>
                  <Label className="mb-1.5 block">Norma específica</Label>
                  <Input value={norma} onChange={(e) => setNorma(e.target.value)} placeholder="Ej. DIN 51524" />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Notas para el proveedor</Label>
                <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Contexto, aplicación, condiciones de operación…" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle label="Necesito ficha técnica del proveedor" checked={fichaTecnica} onChange={setFichaTecnica} />
                <Toggle label="Requiero visita técnica previa" checked={visitaTecnica} onChange={setVisitaTecnica} />
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {!result && step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-ink-950">Condiciones comerciales</h2>
              <div>
                <Label className="mb-1.5 block">Lugar de entrega</Label>
                <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block">Condición de pago</Label>
                  <Select value={pago} onChange={(e) => setPago(e.target.value as CondicionPago)}>
                    <option value="contado">Contado</option>
                    <option value="30">Crédito 30 días</option>
                    <option value="60">Crédito 60 días</option>
                    <option value="90">Crédito 90 días</option>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block">Presupuesto máximo (opcional)</Label>
                  <Input value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)} placeholder="$ MXN" />
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <Toggle label="Necesito CFDI (factura fiscal)" checked={cfdi} onChange={setCfdi} />
                {cfdi && (
                  <div className="mt-3">
                    <Label className="mb-1.5 block">RFC para facturación</Label>
                    <Input value={rfc} onChange={(e) => setRfc(e.target.value)} className="font-mono uppercase" />
                  </div>
                )}
              </div>
              <div className="rounded-lg border bg-card p-4">
                <Toggle label="¿Compra recurrente?" checked={recurrente} onChange={setRecurrente} />
                {recurrente && (
                  <div className="mt-3">
                    <Label className="mb-1.5 block">Frecuencia</Label>
                    <Select value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)}>
                      <option value="30">Cada 30 días</option>
                      <option value="60">Cada 60 días</option>
                      <option value="90">Cada 90 días</option>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 4 — Confirmación con countdown */}
          {result && (
            <div className="overflow-hidden rounded-2xl border bg-ink-950 text-white">
              <div className="relative px-6 py-10 text-center glow-accent">
                <CheckCircle2 className="mx-auto size-12 text-emerald-400" />
                <h2 className="mt-3 font-display text-2xl font-bold">¡Solicitud recibida! {result.folio}</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-ink-300">
                  Nuestra mesa de operaciones ya está consiguiendo tus precios.
                </p>
                <div className="mt-7">
                  <Countdown deadline={result.deadline} />
                </div>
                <Badge variant="purplecow" className="mt-5">
                  <Zap className="size-3.5" /> Garantía: 2h o tu siguiente orden con 0% comisión
                </Badge>
              </div>
              <div className="space-y-4 border-t border-white/10 bg-ink-900/50 p-6">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Avísame cuando esté lista</p>
                  <div className="flex flex-wrap gap-2">
                    {[{ k: "whatsapp", l: "WhatsApp" }, { k: "email", l: "Email" }, { k: "app", l: "App" }].map((c) => {
                      const on = canales.includes(c.k);
                      return (
                        <button
                          key={c.k}
                          onClick={() => setCanales((a) => (on ? a.filter((x) => x !== c.k) : [...a, c.k]))}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            on ? "border-safety bg-safety/20 text-white" : "border-white/20 text-ink-300",
                          )}
                        >
                          {on && <Check className="mr-1 inline size-3" />}{c.l}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/dashboard" className={cn(buttonVariants({ variant: "gradient" }), "flex-1")}>
                    Ver estado en dashboard
                  </Link>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Cotización MROLink ${result.folio} en proceso`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "outline" }), "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white")}
                  >
                    <MessageCircle className="size-4" /> Compartir
                  </a>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Resumen lateral + navegación */}
      {!result && (
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="size-4" /> Atrás
          </Button>
          {step < 2 ? (
            <Button
              variant="default"
              onClick={() => canContinue() ? setStep((s) => s + 1) : toast({ type: "error", title: "Agrega al menos una partida" })}
            >
              Continuar <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button variant="gradient" size="lg" onClick={submit} disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <><FileSpreadsheet className="size-4" /> Enviar solicitud</>}
            </Button>
          )}
        </div>
      )}

      {/* Garantía siempre visible durante el wizard */}
      {!result && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-purplecow-50 px-4 py-3 text-sm text-purplecow-600">
          <Zap className="size-4" /> Cotización confirmada en 2 horas hábiles o tu siguiente orden va con 0% de comisión.
        </div>
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <span className="text-sm text-ink-700">{label}</span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-safety" : "bg-ink-200")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}

function DesconocidoForm({ onAdd }: { onAdd: (it: Item) => void }) {
  const [desc, setDesc] = useState("");
  const [cant, setCant] = useState(1);
  const [uni, setUni] = useState("pza");
  const [foto, setFoto] = useState<string | undefined>();
  return (
    <div className="rounded-xl border bg-card p-4">
      <Label className="mb-1.5 block">Describe el componente</Label>
      <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ej. balero de la flecha del motor de la banda 3, ~25mm interior, sellado" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Input type="number" min={1} value={cant} onChange={(e) => setCant(Math.max(1, Number(e.target.value) || 1))} />
        <Select value={uni} onChange={(e) => setUni(e.target.value)}>
          <option value="pza">pza</option><option value="par">par</option><option value="caja">caja</option><option value="kit">kit</option>
        </Select>
        <label className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}>
          <ImagePlus className="size-4" /> {foto ? "Foto ✓" : "Foto"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setFoto(e.target.files?.[0]?.name)} />
        </label>
      </div>
      <Button
        variant="default"
        size="sm"
        className="mt-3"
        onClick={() => {
          if (desc.trim().length < 3) return;
          onAdd({ descripcion: desc, numero_parte: "", cantidad: cant, unidad: uni, imagen: foto });
          setDesc(""); setCant(1); setFoto(undefined);
        }}
      >
        <Plus className="size-4" /> Agregar partida
      </Button>
    </div>
  );
}
