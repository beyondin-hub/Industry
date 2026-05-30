"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import type { AdminRole } from "@/lib/admin/permissions";

const ROLES: AdminRole[] = ["super_admin", "ops", "finanzas", "soporte"];

export async function inviteTeamMember(input: { nombre: string; email: string; rol: AdminRole }): Promise<{ ok: boolean; error?: string }> {
  if (!input.email.includes("@") || input.nombre.trim().length < 2 || !ROLES.includes(input.rol)) {
    return { ok: false, error: "Datos inválidos." };
  }
  const admin = createAdminClient();
  if (!admin) {
    await logAudit({ accion: "team.invite", entidad: "team_member", entidad_id: input.email, detalle: `Invitó operador (${input.rol})` });
    return { ok: true }; // demo
  }
  try {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
      data: { nombre: input.nombre },
    });
    if (error || !data.user) return { ok: false, error: error?.message ?? "No se pudo invitar." };
    // Rol de plataforma = admin; rol interno = input.rol.
    await admin.auth.admin.updateUserById(data.user.id, {
      app_metadata: { role: "admin", admin_role: input.rol },
    });
    await admin.from("team_members").insert({ id: data.user.id, nombre: input.nombre, email: input.email, rol_admin: input.rol });
    await logAudit({ accion: "team.invite", entidad: "team_member", entidad_id: input.email, detalle: `Invitó operador (${input.rol})` });
    return { ok: true };
  } catch {
    return { ok: false, error: "Error al invitar." };
  }
}

export async function updateTeamRole(input: { id: string; email: string; rol: AdminRole }): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    await logAudit({ accion: "team.update_role", entidad: "team_member", entidad_id: input.email, detalle: `Rol → ${input.rol}` });
    return { ok: true };
  }
  try {
    await admin.from("team_members").update({ rol_admin: input.rol }).eq("id", input.id);
    await admin.auth.admin.updateUserById(input.id, { app_metadata: { role: "admin", admin_role: input.rol } });
    await logAudit({ accion: "team.update_role", entidad: "team_member", entidad_id: input.email, detalle: `Rol → ${input.rol}` });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo cambiar el rol." };
  }
}

export async function setTeamActive(input: { id: string; email: string; activo: boolean }): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    await logAudit({ accion: input.activo ? "team.activate" : "team.suspend", entidad: "team_member", entidad_id: input.email });
    return { ok: true };
  }
  try {
    await supabase.from("team_members").update({ activo: input.activo }).eq("id", input.id);
    await logAudit({ accion: input.activo ? "team.activate" : "team.suspend", entidad: "team_member", entidad_id: input.email });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar." };
  }
}
