"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Inicio de sesión con email/contraseña. En demo (sin config) entra directo. */
export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createClient();
  if (!supabase) redirect("/dashboard"); // modo demo

  const { error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent("Credenciales inválidas")}`);
  redirect("/dashboard");
}

/** Enlace mágico (magic link) por email. */
export async function magicLinkAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const supabase = createClient();
  if (!supabase) redirect("/dashboard");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase!.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${appUrl}/dashboard` },
  });
  if (error) redirect(`/login?error=${encodeURIComponent("No se pudo enviar el enlace")}`);
  redirect(`/login?sent=1`);
}

/** Registro de empresa + comprador admin. */
export async function signUpAction(formData: FormData) {
  const supabase = createClient();
  if (!supabase) redirect("/dashboard"); // modo demo

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const empresa = String(formData.get("empresa") ?? "");
  const rfc = String(formData.get("rfc") ?? "").toUpperCase();
  const ciudad = String(formData.get("ciudad") ?? "");
  const industria = String(formData.get("industria") ?? "");
  const nombre = String(formData.get("nombre") ?? "");
  const telefono = String(formData.get("telefono") ?? "");

  const fail = (msg: string) => redirect(`/registro?error=${encodeURIComponent(msg)}`);

  const { data: signUp, error: signErr } = await supabase!.auth.signUp({ email, password });
  if (signErr || !signUp.user) return fail(signErr?.message ?? "No se pudo crear la cuenta");

  // Alta de empresa y comprador con service-role (bypassa RLS de forma segura en servidor).
  const admin = createAdminClient();
  if (admin) {
    const { data: company, error: compErr } = await admin
      .from("companies")
      .insert({ nombre: empresa, rfc, ciudad, industria })
      .select("id")
      .single();
    if (compErr || !company) return fail("No se pudo registrar la empresa (¿RFC duplicado?)");

    const { error: buyerErr } = await admin.from("buyers").insert({
      id: signUp.user.id,
      company_id: company.id,
      nombre,
      telefono,
      puesto: "Gerente de Compras",
      rol: "admin_empresa",
      limite_compra: 100000,
    });
    if (buyerErr) return fail("Cuenta creada pero falló el alta del usuario");
  }

  redirect("/dashboard");
}

/** Cierre de sesión. */
export async function logoutAction() {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}
