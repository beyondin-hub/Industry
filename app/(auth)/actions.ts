"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loginSchema, magicLinkSchema, signupSchema } from "@/lib/validations";
import { homeForRole, roleFromUser } from "@/lib/auth";

export interface ActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
}

/** Inicio de sesión con email/contraseña. En demo (sin config) responde ok. */
export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Revisa los datos ingresados." };

  const supabase = createClient();
  if (!supabase) return { ok: true, redirectTo: "/dashboard" }; // modo demo

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: "Correo o contraseña incorrectos." };
  return { ok: true, redirectTo: homeForRole(roleFromUser(data.user)) };
}

/** Enlace mágico (magic link) por email. */
export async function magicLinkAction(input: unknown): Promise<ActionResult> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Correo no válido." };

  const supabase = createClient();
  if (!supabase) return { ok: true, message: "demo" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard` },
  });
  if (error) return { ok: false, error: "No se pudo enviar el enlace." };
  return { ok: true, message: "Te enviamos un enlace de acceso a tu correo." };
}

/** Registro de empresa + comprador admin. */
export async function signUpAction(input: unknown): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Revisa los datos del formulario." };
  const d = parsed.data;

  const supabase = createClient();
  if (!supabase) return { ok: true }; // modo demo

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data: signUp, error: signErr } = await supabase.auth.signUp({
    email: d.email,
    password: d.password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard`,
      data: { role: "comprador" },
    },
  });
  if (signErr || !signUp.user) {
    return { ok: false, error: signErr?.message ?? "No se pudo crear la cuenta." };
  }

  const admin = createAdminClient();
  if (admin) {
    const { data: company, error: compErr } = await admin
      .from("companies")
      .insert({ nombre: d.empresa, rfc: d.rfc.toUpperCase(), ciudad: d.ciudad, industria: d.industria })
      .select("id")
      .single();
    if (compErr || !company) {
      return { ok: false, error: "No se pudo registrar la empresa (¿RFC duplicado?)." };
    }
    const { error: buyerErr } = await admin.from("buyers").insert({
      id: signUp.user.id,
      company_id: company.id,
      nombre: d.nombre,
      telefono: d.telefono,
      puesto: "Gerente de Compras",
      rol: "admin_empresa",
      limite_compra: 100000,
    });
    if (buyerErr) return { ok: false, error: "Cuenta creada pero falló el alta del usuario." };
  }
  return { ok: true };
}

/** Cierre de sesión. */
export async function logoutAction() {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
