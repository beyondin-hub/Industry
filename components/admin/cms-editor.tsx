"use client";

import { useState } from "react";
import { Save, Loader2, Plus, Trash2, Eye, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { saveSiteContent } from "@/app/(admin)/admin/cms/actions";
import type { SiteContent } from "@/lib/data/admin";

export function CmsEditor({ initial }: { initial: SiteContent }) {
  const { toast } = useToast();
  const [c, setC] = useState<SiteContent>(initial);
  const [saving, setSaving] = useState(false);

  const set = (p: Partial<SiteContent>) => setC((x) => ({ ...x, ...p }));

  async function guardar() {
    setSaving(true);
    const res = await saveSiteContent(c);
    setSaving(false);
    toast({ type: res.ok ? "success" : "error", title: res.ok ? "Contenido publicado" : "No se pudo guardar", description: res.error });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="gradient" onClick={guardar} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4" /> Publicar contenido</>}</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Banner */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="size-5 text-safety" /> Banner de anuncio</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <button type="button" onClick={() => set({ banner: { ...c.banner, activo: !c.banner.activo } })} className="flex w-full items-center justify-between">
                <span className="text-sm text-ink-700">Mostrar banner en el sitio</span>
                <span className={cn("relative h-6 w-11 rounded-full transition-colors", c.banner.activo ? "bg-safety" : "bg-ink-200")}>
                  <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-all", c.banner.activo ? "left-[22px]" : "left-0.5")} />
                </span>
              </button>
              <Input value={c.banner.texto} onChange={(e) => set({ banner: { ...c.banner, texto: e.target.value } })} placeholder="Texto del banner" />
            </CardContent>
          </Card>

          {/* Hero */}
          <Card>
            <CardHeader><CardTitle>Hero (home comprador)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label className="mb-1 block text-[11px]">Título</Label><Input value={c.hero_titulo} onChange={(e) => set({ hero_titulo: e.target.value })} /></div>
              <div><Label className="mb-1 block text-[11px]">Título destacado (gradiente)</Label><Input value={c.hero_destacado} onChange={(e) => set({ hero_destacado: e.target.value })} /></div>
              <div><Label className="mb-1 block text-[11px]">Subtítulo</Label><Textarea value={c.hero_subtitulo} onChange={(e) => set({ hero_subtitulo: e.target.value })} /></div>
              <div><Label className="mb-1 block text-[11px]">Garantía</Label><Input value={c.garantia} onChange={(e) => set({ garantia: e.target.value })} /></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Vista previa */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="size-5 text-ink-500" /> Vista previa</CardTitle></CardHeader>
            <CardContent>
              {c.banner.activo && <div className="mb-3 rounded-lg bg-ink-950 px-3 py-2 text-center text-xs text-white">{c.banner.texto}</div>}
              <div className="rounded-xl border bg-gradient-to-b from-paper-100 to-paper-300 p-5 text-center">
                <h3 className="font-display text-2xl font-extrabold leading-tight text-ink-950">
                  {c.hero_titulo} <span className="text-gradient">{c.hero_destacado}</span>
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-600">{c.hero_subtitulo}</p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>FAQ</CardTitle>
              <Button variant="outline" size="sm" onClick={() => set({ faq: [...c.faq, { q: "", a: "" }] })}><Plus className="size-4" /> Pregunta</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {c.faq.map((f, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Input value={f.q} onChange={(e) => set({ faq: c.faq.map((x, idx) => (idx === i ? { ...x, q: e.target.value } : x)) })} placeholder="Pregunta" />
                    <button onClick={() => set({ faq: c.faq.filter((_, idx) => idx !== i) })} className="text-danger hover:opacity-70"><Trash2 className="size-4" /></button>
                  </div>
                  <Textarea value={f.a} onChange={(e) => set({ faq: c.faq.map((x, idx) => (idx === i ? { ...x, a: e.target.value } : x)) })} placeholder="Respuesta" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
