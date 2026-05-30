"use client";

import { useState } from "react";
import { Save, Loader2, MessageCircle, Mail, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { saveNotificationRules } from "@/app/(admin)/admin/cms/actions";
import type { NotificationRule } from "@/lib/data/admin";

const CANALES: { k: "whatsapp" | "email" | "web"; label: string; icon: any }[] = [
  { k: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { k: "email", label: "Email", icon: Mail },
  { k: "web", label: "App", icon: Globe },
];

export function AutomationManager({ initial }: { initial: NotificationRule[] }) {
  const { toast } = useToast();
  const [rules, setRules] = useState(initial);
  const [saving, setSaving] = useState(false);

  function patch(id: string, p: Partial<NotificationRule>) {
    setRules((a) => a.map((r) => (r.id === id ? { ...r, ...p } : r)));
  }
  function toggleCanal(r: NotificationRule, k: "whatsapp" | "email" | "web") {
    const canales = r.canales.includes(k) ? r.canales.filter((x) => x !== k) : [...r.canales, k];
    patch(r.id, { canales });
  }
  async function guardar() {
    setSaving(true);
    const res = await saveNotificationRules(rules);
    setSaving(false);
    toast({ type: res.ok ? "success" : "error", title: res.ok ? "Automatizaciones guardadas" : "No se pudo guardar", description: res.error });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="gradient" onClick={guardar} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4" /> Guardar reglas</>}</Button>
      </div>
      {rules.map((r) => (
        <Card key={r.id} className={cn(!r.activo && "opacity-70")}>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-ink-900">{r.evento}</p>
                  <Badge variant={r.activo ? "success" : "secondary"} className="text-[10px]">{r.activo ? "Activa" : "Pausada"}</Badge>
                </div>
                <p className="text-xs text-ink-500">{r.descripcion}</p>
              </div>
              <button type="button" onClick={() => patch(r.id, { activo: !r.activo })} className="flex items-center gap-2">
                <span className={cn("relative h-6 w-11 rounded-full transition-colors", r.activo ? "bg-safety" : "bg-ink-200")}>
                  <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-all", r.activo ? "left-[22px]" : "left-0.5")} />
                </span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CANALES.map((ch) => {
                const on = r.canales.includes(ch.k);
                const Icon = ch.icon;
                return (
                  <button key={ch.k} onClick={() => toggleCanal(r, ch.k)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors", on ? "border-safety bg-safety-50 text-safety" : "border-border text-ink-500 hover:border-ink-300")}>
                    <Icon className="size-3.5" /> {ch.label}
                  </button>
                );
              })}
            </div>
            <Textarea value={r.plantilla} onChange={(e) => patch(r.id, { plantilla: e.target.value })} className="text-sm" />
            <p className="text-[11px] text-ink-400">Variables: {"{folio}"}, {"{total}"}, {"{eta}"}, {"{monto}"}, {"{dias}"}, {"{producto}"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
