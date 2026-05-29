import { createClient } from "@/lib/supabase/server";
import { CURRENT_BUYER, CURRENT_COMPANY } from "@/lib/data/account";
import type { Buyer, Company } from "@/types";

export interface SessionContext {
  company: Company;
  buyer: Buyer;
  isDemo: boolean;
  /** id de auth del usuario (null en demo). */
  userId: string | null;
}

/**
 * Resuelve la empresa y el comprador de la sesión actual.
 * - Con Supabase configurado y sesión activa: lee buyers + companies.
 * - Sin sesión o sin configuración: usa el contexto demo.
 * Resiliente: cualquier error cae a demo para no romper la UI.
 */
export async function getContext(): Promise<SessionContext> {
  const supabase = createClient();
  if (!supabase) {
    return { company: CURRENT_COMPANY, buyer: CURRENT_BUYER, isDemo: true, userId: null };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { company: CURRENT_COMPANY, buyer: CURRENT_BUYER, isDemo: true, userId: null };
    }

    const { data: buyer } = await supabase
      .from("buyers")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!buyer) {
      return { company: CURRENT_COMPANY, buyer: CURRENT_BUYER, isDemo: true, userId: user.id };
    }

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", buyer.company_id)
      .single();

    return {
      company: (company as Company) ?? CURRENT_COMPANY,
      buyer: { ...buyer, email: user.email } as Buyer,
      isDemo: false,
      userId: user.id,
    };
  } catch {
    return { company: CURRENT_COMPANY, buyer: CURRENT_BUYER, isDemo: true, userId: null };
  }
}
