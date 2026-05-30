"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { evaluarCredito, type CreditDecision } from "@/lib/credit/engine";
import { mxn } from "@/lib/utils";

/** Corre el motor de scoring para una solicitud. */
export async function scoreRequest(input: { industria?: string; antiguedadMeses?: number; gmv6m?: number; limiteSolicitado?: number }): Promise<CreditDecision> {
  return evaluarCredito(input);
}

/** Resuelve una solicitud: aprueba (ajusta la línea de la empresa) o rechaza. */
export async function resolveCreditRequest(input: {
  requestId: string;
  companyId: string;
  empresa: string;
  aprobar: boolean;
  limite?: number;
  dias?: 0 | 30 | 60 | 90;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const detalle = input.aprobar
    ? `Aprobó crédito ${mxn(input.limite ?? 0)} / ${input.dias ?? 30} días`
    : "Rechazó la solicitud de crédito";

  if (!supabase) {
    await logAudit({ accion: input.aprobar ? "credit.approve" : "credit.reject", entidad: "company", entidad_id: input.empresa, detalle });
    return { ok: true };
  }
  try {
    await supabase
      .from("credit_requests")
      .update({ estado: input.aprobar ? "aprobado" : "rechazado", limite_aprobado: input.limite ?? 0, dias: input.dias ?? 0, resuelto_at: new Date().toISOString() })
      .eq("id", input.requestId);

    if (input.aprobar) {
      await supabase
        .from("companies")
        .update({ limite_credito: input.limite ?? 0, dias_credito: input.dias ?? 30, credito_aprobado: true })
        .eq("id", input.companyId);
    }
    await logAudit({ accion: input.aprobar ? "credit.approve" : "credit.reject", entidad: "company", entidad_id: input.empresa, detalle });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo resolver la solicitud." };
  }
}
