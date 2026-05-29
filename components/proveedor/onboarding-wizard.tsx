"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Tags, PackageCheck, Banknote, FileCheck2, Check, ChevronLeft,
  ChevronRight, Loader2, ShieldCheck, Sparkles, Store, Clock, Lock, ArrowRight,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CATEGORIAS, CERTIFICACIONES, CIUDADES } from "@/lib/constants";
import { FULFILLMENT_OPTIONS } from "@/lib/pricing/provider";
import { registerProvider } from "@/app/vender/registro/actions";
import { cn } from "@/lib/utils";

const STEPS = ["Negocio", "Categorías", "Cumplimiento", "Cobro", "Confirmar"];

export function OnboardingWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [fundador, setFundador] = useState(27);

  // Estado
  const [biz, setBiz] = useState({ razon: "", rfc: "", comercial: "", ciudad: "", anios: "", web: "", email: "", tel: "", password: "" });
  const [cats, setCats] = useState<string[]>([]);
  const [certs, setCerts] = useState<string[]>([]);
  const [marcas, setMarcas] = useState("");
  const [fulfillment, setFulfillment] = useState<string[]>(["dropshipping"]);
  const [cobertura, setCobertura] = useState<string[]>([]);
  const [entrega, setEntrega] = useState("48");
  const [clabe, setClabe] = useState("");
  const [financiar, setFinanciar] = useState(true);
  const [pago, setPago] = useState("30");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaNoCircunvencion, setAceptaNoCircunvencion] = useState(false);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  function canContinue() {
    if (step === 0) return biz.razon.length > 2 && /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i.test(biz.rfc) && !!biz.ciudad && biz.email.includes("@") && biz.password.length >= 6;
    if (step === 1) return cats.length > 0;
    if (step === 2) return fulfillment.length > 0;
    if (step === 3) return clabe.replace(/\s/g, "").length >= 18;
    if (step === 4) return aceptaTerminos && aceptaNoCircunvencion;
    return true;
  }

  function next() {
    if (!canContinue()) {
      toast({ type: "error", title: "Completa los campos requeridos para continuar" });
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  async function submit() {
    setPending(true);
    const res = await registerProvider({
      razon: biz.razon, rfc: biz.rfc, comercial: biz.comercial, ciudad: biz.ciudad,
      anios: biz.anios ? Number(biz.anios) : undefined, email: biz.email, password: biz.password,
      telefono: biz.tel, categorias: cats, certificaciones: certs, marcas,
      fulfillment, cobertura, clabe: clabe.replace(/\s/g, ""),
      acepta_financiamiento: financiar, plazo_pago: pago,
    });
    setPending(false);
    if (res.ok) {
      setFundador(res.fundador ?? 27);
      setDone(true);
      toast({ type: "success", title: "¡Solicitud enviada!", description: "Tu cuenta entró en revisión por Novak." });
    } else {
      toast({ type: "error", title: "No se pudo enviar tu solicitud", description: res.error });
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-ink-950 p-10 text-center text-white glow-accent">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-safety/20"><Clock className="size-8 text-safety" /></span>
        <h2 className="mt-4 font-display text-2xl font-bold">¡Solicitud recibida! #{String(fundador).padStart(3, "0")}</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-300">
          Tu cuenta está <strong className="text-white">en revisión</strong> por el equipo de Novak (normalmente 24–48h hábiles).
          Mientras tanto, entra y explora la plataforma y prepara tu catálogo —
          podrás vender en cuanto te aprobemos.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-ink-200">
          <Lock className="size-3.5 text-safety" /> Sin cuota de entrada ni mensualidad
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/proveedor/dashboard" className={cn(buttonVariants({ variant: "gradient" }))}>
            Explorar mi portal <ArrowRight className="size-4" />
          </Link>
          <Link href="/proveedor/productos" className={cn(buttonVariants({ variant: "outline" }), "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white")}>
            <Sparkles className="size-4" /> Preparar mi catálogo
          </Link>
        </div>
      </div>
    );
  }

  const STEP_ICONS = [Building2, Tags, PackageCheck, Banknote, FileCheck2];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-3 flex justify-between">
          {STEPS.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
                <div className={cn("flex size-8 items-center justify-center rounded-full transition-colors", i < step ? "gradient-accent text-white" : i === step ? "bg-ink-950 text-white" : "bg-secondary text-ink-400")}>
                  {i < step ? <Check className="size-4" /> : <Icon className="size-4" />}
                </div>
                <span className={cn("text-[11px]", i <= step ? "font-medium text-ink-800" : "text-ink-400")}>{s}</span>
              </div>
            );
          })}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div className="h-full gradient-accent" initial={false} animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} className="rounded-2xl border bg-card p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-ink-950">Datos de tu negocio</h2>
              <div>
                <Label className="mb-1.5 block">Razón social *</Label>
                <Input value={biz.razon} onChange={(e) => setBiz({ ...biz, razon: e.target.value })} placeholder="Distribuidora Industrial SA de CV" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block">RFC *</Label>
                  <Input value={biz.rfc} onChange={(e) => setBiz({ ...biz, rfc: e.target.value })} className="font-mono uppercase" placeholder="ABC123456XY7" />
                </div>
                <div>
                  <Label className="mb-1.5 block">Nombre comercial</Label>
                  <Input value={biz.comercial} onChange={(e) => setBiz({ ...biz, comercial: e.target.value })} placeholder="Cómo te conocen" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block">Ciudad *</Label>
                  <Select value={biz.ciudad} onChange={(e) => setBiz({ ...biz, ciudad: e.target.value })}>
                    <option value="">Selecciona…</option>
                    {CIUDADES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block">Años operando</Label>
                  <Input type="number" min={0} value={biz.anios} onChange={(e) => setBiz({ ...biz, anios: e.target.value })} placeholder="Ej. 8" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block">Email *</Label>
                  <Input type="email" value={biz.email} onChange={(e) => setBiz({ ...biz, email: e.target.value })} placeholder="ventas@tuempresa.mx" />
                </div>
                <div>
                  <Label className="mb-1.5 block">WhatsApp</Label>
                  <Input value={biz.tel} onChange={(e) => setBiz({ ...biz, tel: e.target.value })} placeholder="+52 ..." />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Contraseña de tu cuenta *</Label>
                <Input type="password" value={biz.password} onChange={(e) => setBiz({ ...biz, password: e.target.value })} placeholder="Mínimo 6 caracteres — para administrar tu cuenta" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-ink-950">¿Qué vendes?</h2>
              <div>
                <Label className="mb-2 block">Categorías que manejas *</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map((c) => (
                    <button key={c.slug} onClick={() => toggle(cats, c.slug, setCats)} className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors", cats.includes(c.slug) ? "border-safety bg-safety-50 text-safety" : "border-border text-ink-600 hover:border-ink-300")}>
                      {cats.includes(c.slug) && <Check className="mr-1 inline size-3" />}{c.emoji} {c.nombre}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Certificaciones</Label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICACIONES.map((c) => (
                    <button key={c} onClick={() => toggle(certs, c, setCerts)} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", certs.includes(c) ? "border-safety bg-safety-50 text-safety" : "border-border text-ink-600 hover:border-ink-300")}>
                      {certs.includes(c) && <Check className="mr-1 inline size-3" />}{c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Marcas que distribuyes</Label>
                <Input value={marcas} onChange={(e) => setMarcas(e.target.value)} placeholder="SKF, Festo, 3M, …" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-ink-950">¿Cómo entregas?</h2>
              <div className="space-y-2">
                {FULFILLMENT_OPTIONS.map((f) => {
                  const on = fulfillment.includes(f.id);
                  return (
                    <button key={f.id} onClick={() => toggle(fulfillment, f.id, setFulfillment)} className={cn("flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors", on ? "border-safety bg-safety-50" : "border-border hover:border-ink-300")}>
                      <span className={cn("mt-0.5 flex size-5 items-center justify-center rounded-md border", on ? "border-safety bg-safety text-white" : "border-ink-300")}>{on && <Check className="size-3.5" />}</span>
                      <span>
                        <span className="block text-sm font-semibold text-ink-900">{f.nombre}</span>
                        <span className="block text-xs text-ink-600">{f.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block">Tiempo de entrega típico</Label>
                  <Select value={entrega} onChange={(e) => setEntrega(e.target.value)}>
                    <option value="24">24 horas</option>
                    <option value="48">24-48 horas</option>
                    <option value="72">2-3 días</option>
                    <option value="120">3-5 días</option>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Cobertura de entrega</Label>
                <div className="flex flex-wrap gap-2">
                  {CIUDADES.map((c) => (
                    <button key={c} onClick={() => toggle(cobertura, c, setCobertura)} className={cn("rounded-full border px-3 py-1 text-xs transition-colors", cobertura.includes(c) ? "border-safety bg-safety-50 text-safety" : "border-border text-ink-600 hover:border-ink-300")}>
                      {cobertura.includes(c) && <Check className="mr-1 inline size-3" />}{c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-ink-950">Cobro y crédito</h2>
              <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                <ShieldCheck className="mr-1 inline size-4" /> Novak te paga a ti. Le facturas a Novak y nosotros cobramos a la maquiladora.
              </div>
              <div>
                <Label className="mb-1.5 block">CLABE interbancaria (para pagarte) *</Label>
                <Input value={clabe} onChange={(e) => setClabe(e.target.value)} className="font-mono" placeholder="18 dígitos" maxLength={18} />
              </div>
              <button onClick={() => setFinanciar((v) => !v)} className="flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left">
                <span className="text-sm text-ink-700">Acepto que Novak financie a la maquiladora y me pague según lo pactado</span>
                <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", financiar ? "bg-safety" : "bg-ink-200")}>
                  <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-all", financiar ? "left-[22px]" : "left-0.5")} />
                </span>
              </button>
              <div>
                <Label className="mb-1.5 block">Plazo de pago que ofreces a Novak</Label>
                <Select value={pago} onChange={(e) => setPago(e.target.value)}>
                  <option value="contado">Contado contra entrega</option>
                  <option value="15">15 días</option>
                  <option value="30">30 días</option>
                  <option value="45">45 días</option>
                </Select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-ink-950">Últimos detalles</h2>
              <div className="rounded-xl border bg-secondary/40 p-4 text-sm">
                <p className="font-semibold text-ink-900">Resumen</p>
                <ul className="mt-2 space-y-1 text-ink-600">
                  <li>• {biz.razon || "—"} ({biz.rfc || "—"}) · {biz.ciudad || "—"}</li>
                  <li>• {cats.length} categorías · {certs.length} certificaciones</li>
                  <li>• Cumplimiento: {fulfillment.length} opción(es)</li>
                  <li>• Plan: <strong>Fundador</strong> · $0 alta · $0 mensualidad · comisión 8–12%</li>
                </ul>
              </div>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-ink-700">
                <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} className="mt-0.5 size-4 accent-safety" />
                Acepto los Términos del Programa de Proveedores y el Aviso de Privacidad de Novak.
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-ink-700">
                <input type="checkbox" checked={aceptaNoCircunvencion} onChange={(e) => setAceptaNoCircunvencion(e.target.checked)} className="mt-0.5 size-4 accent-safety" />
                Acepto la <strong>cláusula de no-circunvención</strong>: no contactaré ni venderé directamente a los compradores que conozca a través de Novak, durante la vigencia y 12 meses posteriores.
              </label>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="size-4" /> Atrás
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="default" onClick={next}>Continuar <ChevronRight className="size-4" /></Button>
        ) : (
          <Button variant="gradient" size="lg" onClick={submit} disabled={pending || !canContinue()}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <><Store className="size-4" /> Crear cuenta de proveedor</>}
          </Button>
        )}
      </div>
    </div>
  );
}
