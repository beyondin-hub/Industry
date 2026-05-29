import { z } from "zod";

// RFC mexicano (persona moral: 12 caracteres; admite física: 13). Validación pragmática.
const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;

export const loginSchema = z.object({
  email: z.string().min(1, "Ingresa tu correo").email("Correo no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const magicLinkSchema = z.object({
  email: z.string().min(1, "Ingresa tu correo").email("Correo no válido"),
});

export const signupSchema = z.object({
  empresa: z.string().min(3, "Nombre de empresa muy corto"),
  rfc: z.string().regex(rfcRegex, "RFC no válido (ej. ABC123456XY7)"),
  ciudad: z.string().min(1, "Selecciona tu ciudad"),
  industria: z.string().min(1, "Selecciona tu industria"),
  nombre: z.string().min(3, "Ingresa tu nombre"),
  telefono: z
    .string()
    .min(10, "Teléfono a 10 dígitos")
    .regex(/^[+\d\s().-]{10,}$/, "Teléfono no válido"),
  email: z.string().min(1, "Ingresa tu correo").email("Correo no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
export type SignupInput = z.infer<typeof signupSchema>;

// Esquema del RFQ (se reutiliza en el wizard de FASE 2).
export const rfqItemSchema = z.object({
  descripcion: z.string().min(3, "Describe el insumo"),
  numero_parte: z.string().optional(),
  cantidad: z.coerce.number().int().positive("Cantidad inválida"),
  unidad: z.string().default("pza"),
  certificacion: z.string().optional(),
});

export const rfqSchema = z.object({
  items: z.array(rfqItemSchema).min(1, "Agrega al menos una partida"),
  urgencia: z.enum(["urgente_24h", "normal", "programado"]).default("normal"),
  condicion_pago: z.enum(["contado", "30", "60", "90"]).default("contado"),
  requiere_cfdi: z.boolean().default(true),
  notas: z.string().optional(),
});
export type RFQInput = z.infer<typeof rfqSchema>;
