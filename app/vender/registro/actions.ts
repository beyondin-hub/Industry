"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { providerSignupSchema } from "@/lib/validations";

export interface ProviderSignupResult {
  ok: boolean;
  error?: string;
  fundador?: number;
}

/**
 * Alta self-service del proveedor: crea la cuenta (auth), la ficha en
 * `providers` (estado pendiente, es_fundador) y el vínculo `provider_users`.
 * En modo demo (sin Supabase) responde ok con número de fundador simulado.
 */
export async function registerProvider(input: unknown): Promise<ProviderSignupResult> {
  const parsed = providerSignupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };
  }
  const d = parsed.data;

  const supabase = createClient();
  const admin = createAdminClient();

  // Demo: sin Supabase configurado.
  if (!supabase || !admin) {
    return { ok: true, fundador: 20 + Math.floor(Math.random() * 30) };
  }

  try {
    // 1. Cuenta de acceso (confirmada para entrar de inmediato).
    const { data: created, error: userErr } = await admin.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
      app_metadata: { role: "proveedor" },
    });
    if (userErr || !created.user) {
      return { ok: false, error: userErr?.message ?? "No se pudo crear la cuenta (¿correo ya registrado?)." };
    }

    // 2. Ficha del proveedor.
    const { data: prov, error: provErr } = await admin
      .from("providers")
      .insert({
        razon_social: d.razon,
        rfc: d.rfc.toUpperCase(),
        nombre_comercial: d.comercial || d.razon,
        ciudad: d.ciudad,
        categorias: d.categorias,
        certificaciones: d.certificaciones,
        marcas: (d.marcas ?? "").split(",").map((m) => m.trim()).filter(Boolean),
        anios_operando: d.anios ?? null,
        email: d.email,
        telefono: d.telefono ?? null,
        clabe: d.clabe,
        fulfillment: d.fulfillment,
        cobertura: d.cobertura,
        acepta_financiamiento: d.acepta_financiamiento,
        plazo_pago: d.plazo_pago,
        estado: "pendiente",
        es_fundador: true,
        plan_membresia: "basico",
        activo: true,
      })
      .select("id")
      .single();
    if (provErr || !prov) {
      return { ok: false, error: "Cuenta creada pero no se pudo registrar la ficha (¿RFC duplicado?)." };
    }

    // 3. Vínculo usuario ↔ proveedor (cuenta administradora).
    const { error: linkErr } = await admin.from("provider_users").insert({
      id: created.user.id,
      provider_id: prov.id,
      nombre: d.comercial || d.razon,
      puesto: "Administrador",
      rol: "admin_proveedor",
    });
    if (linkErr) return { ok: false, error: "No se pudo vincular tu usuario al proveedor." };

    // 4. Inicia sesión en el navegador.
    await supabase.auth.signInWithPassword({ email: d.email, password: d.password });

    return { ok: true, fundador: 27 };
  } catch {
    return { ok: false, error: "Ocurrió un error en el alta. Intenta de nuevo." };
  }
}
