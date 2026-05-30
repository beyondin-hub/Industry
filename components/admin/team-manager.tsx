"use client";

import { useState } from "react";
import { UserPlus, X, Loader2, Check, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ADMIN_ROLES, ADMIN_SECTIONS, can, type AdminRole } from "@/lib/admin/permissions";
import { fechaCorta, cn } from "@/lib/utils";
import { inviteTeamMember, updateTeamRole, setTeamActive } from "@/app/(admin)/admin/equipo/actions";
import type { TeamMember } from "@/lib/data/admin";

const SECTION_LABEL: Record<string, string> = {
  dashboard: "Inicio", rfq: "Mesa", cotizador: "Cotizador", proveedores: "Proveedores",
  compradores: "Compradores", tesoreria: "Tesorería", equipo: "Equipo", auditoria: "Auditoría",
};

export function TeamManager({ initial }: { initial: TeamMember[] }) {
  const { toast } = useToast();
  const [members, setMembers] = useState(initial);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function changeRole(m: TeamMember, rol: AdminRole) {
    setMembers((a) => a.map((x) => (x.id === m.id ? { ...x, rol_admin: rol } : x)));
    const res = await updateTeamRole({ id: m.id, email: m.email, rol });
    toast({ type: res.ok ? "success" : "error", title: res.ok ? `Rol actualizado · ${m.nombre}` : "No se pudo", description: res.error });
  }
  async function toggleActive(m: TeamMember) {
    setBusy(m.id);
    const activo = !m.activo;
    const res = await setTeamActive({ id: m.id, email: m.email, activo });
    setBusy(null);
    if (res.ok) {
      setMembers((a) => a.map((x) => (x.id === m.id ? { ...x, activo } : x)));
      toast({ type: "success", title: activo ? "Operador reactivado" : "Operador suspendido", description: m.nombre });
    } else toast({ type: "error", title: "No se pudo", description: res.error });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Operadores ({members.length})</CardTitle>
          <Button variant="gradient" size="sm" onClick={() => setOpen(true)}><UserPlus className="size-4" /> Invitar operador</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left text-xs text-ink-500">
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Correo</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Alta</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-secondary/30">
                    <td className="px-5 py-3 font-semibold text-ink-900">{m.nombre}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-600">{m.email}</td>
                    <td className="px-5 py-3">
                      <Select value={m.rol_admin} onChange={(e) => changeRole(m, e.target.value as AdminRole)} className="h-8 w-40">
                        {ADMIN_ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </Select>
                    </td>
                    <td className="px-5 py-3 text-ink-500">{fechaCorta(m.created_at)}</td>
                    <td className="px-5 py-3"><Badge variant={m.activo ? "success" : "secondary"}>{m.activo ? "Activo" : "Suspendido"}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="outline" size="sm" disabled={busy === m.id} onClick={() => toggleActive(m)}>
                        {busy === m.id ? <Loader2 className="size-4 animate-spin" /> : m.activo ? "Suspender" : "Reactivar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Matriz de permisos */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-safety" /> Permisos por rol</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-left text-xs text-ink-500">
                  <th className="px-5 py-3 font-medium">Sección</th>
                  {ADMIN_ROLES.map((r) => <th key={r.id} className="px-3 py-3 text-center font-medium">{r.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {ADMIN_SECTIONS.map((s) => (
                  <tr key={s} className="border-b last:border-0">
                    <td className="px-5 py-2.5 font-medium text-ink-800">{SECTION_LABEL[s]}</td>
                    {ADMIN_ROLES.map((r) => (
                      <td key={r.id} className="px-3 py-2.5 text-center">
                        {can(r.id, s) ? <Check className="mx-auto size-4 text-emerald-600" /> : <span className="text-ink-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {open && <InviteModal onClose={() => setOpen(false)} onInvited={(m) => setMembers((a) => [m, ...a])} />}
    </div>
  );
}

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: (m: TeamMember) => void }) {
  const { toast } = useToast();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<AdminRole>("ops");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    const res = await inviteTeamMember({ nombre, email, rol });
    setPending(false);
    if (res.ok) {
      onInvited({ id: `tm-${Date.now()}`, nombre, email, rol_admin: rol, activo: true, created_at: new Date().toISOString() });
      toast({ type: "success", title: "Invitación enviada", description: `${email} · ${rol}` });
      onClose();
    } else toast({ type: "error", title: "No se pudo invitar", description: res.error });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink-900">Invitar operador Novak</h3>
          <button onClick={onClose} aria-label="Cerrar" className="text-ink-400 hover:text-ink-800"><X className="size-5" /></button>
        </div>
        <div className="space-y-3">
          <div><Label className="mb-1.5 block">Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre y apellido" /></div>
          <div><Label className="mb-1.5 block">Correo</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="persona@heynovak.com" /></div>
          <div>
            <Label className="mb-1.5 block">Rol</Label>
            <Select value={rol} onChange={(e) => setRol(e.target.value as AdminRole)}>
              {ADMIN_ROLES.map((r) => <option key={r.id} value={r.id}>{r.label} — {r.desc}</option>)}
            </Select>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="gradient" onClick={submit} disabled={pending || !email.includes("@") || nombre.length < 2}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Enviar invitación"}
          </Button>
        </div>
      </div>
    </div>
  );
}
