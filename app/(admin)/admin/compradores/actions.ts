"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { evaluarCredito, type CreditDecision } from "@/lib/credit/engine";
import { mxn } from "@/lib/utils";

export async function setCreditLine(input: { companyId: string; nombre: string; limite: number; dias: 0 | 30 | 60 | 90 }): Promise<{ ok: boolean; error?: string }> {
  if (input.limite < 0) return { ok: false, error: "Límite inválido." };
  const supabase = createClient();
  const detalle = `Línea ${mxn(input.limite)} / ${input.dias} días`;
  if (!supabase) {
    await logAudit({ accion: "credit.set_line", entidad: "company", entidad_id: input.companyId, detalle });
    return { ok: true };
  }
  try {
    const { error } = await supabase
      .from("companies")
      .update({ limite_credito: input.limite, dias_credito: input.dias, credito_aprobado: input.limite > 0 })
      .eq("id", input.companyId);
    if (error) return { ok: false, error: error.message };
    await logAudit({ accion: "credit.set_line", entidad: "company", entidad_id: input.companyId, detalle });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo ajustar la línea." };
  }
}

export async function setKyc(input: { companyId: string; estado: "verificado" | "rechazado" }): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    await logAudit({ accion: "kyc.set", entidad: "company", entidad_id: input.companyId, detalle: input.estado });
    return { ok: true };
  }
  try {
    await supabase.from("companies").update({ kyc_estado: input.estado }).eq("id", input.companyId);
    await logAudit({ accion: "kyc.set", entidad: "company", entidad_id: input.companyId, detalle: input.estado });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el KYC." };
  }
}

export async function setCompanyEstado(input: { companyId: string; estado: "activa" | "suspendida" }): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  if (!supabase) {
    await logAudit({ accion: input.estado === "suspendida" ? "company.suspend" : "company.activate", entidad: "company", entidad_id: input.companyId });
    return { ok: true };
  }
  try {
    await supabase.from("companies").update({ estado: input.estado }).eq("id", input.companyId);
    await logAudit({ accion: input.estado === "suspendida" ? "company.suspend" : "company.activate", entidad: "company", entidad_id: input.companyId });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar la cuenta." };
  }
}

/** Corre el motor de scoring para sugerir una línea. */
export async function scoreCompany(input: { industria?: string; antiguedadMeses?: number; gmv6m?: number }): Promise<CreditDecision> {
  return evaluarCredito(input);
}
