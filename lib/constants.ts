import type { CategoriaMRO, Ciudad, Industria } from "@/types";

// La marca
export const BRAND = {
  name: "Novak",
  domain: "heynovak.com",
  url: "https://heynovak.com",
  tagline: "Tu equipo de compras externo para la industria maquiladora",
  why: "Ninguna línea de producción debería parar por un problema de suministro resoluble en horas.",
  whatsapp: "+52 664 000 0000",
  whatsappLink: "https://wa.me/526640000000",
  email: "hola@heynovak.com",
  garantia:
    "Cotización confirmada en 2 horas hábiles o tu siguiente orden va con 0% de comisión.",
} as const;

// Taxonomía industrial profunda (estilo McMaster-Carr): por uso, no solo por nombre.
export interface CategoriaDef {
  slug: CategoriaMRO;
  nombre: string;
  descripcion: string;
  subcategorias: string[];
  emoji: string;
}

export const CATEGORIAS: CategoriaDef[] = [
  {
    slug: "rodamientos",
    nombre: "Rodamientos y Transmisión",
    descripcion: "Baleros, chumaceras, bandas, poleas y cadenas.",
    subcategorias: ["Baleros de bolas", "Baleros de rodillos", "Chumaceras", "Bandas en V", "Poleas"],
    emoji: "⚙️",
  },
  {
    slug: "epp",
    nombre: "Equipo de Protección Personal",
    descripcion: "Guantes, lentes, respiradores, calzado y arnés.",
    subcategorias: ["Guantes", "Protección ocular", "Respiradores", "Calzado", "Protección auditiva"],
    emoji: "🦺",
  },
  {
    slug: "lubricantes",
    nombre: "Lubricantes y Químicos",
    descripcion: "Grasas, aceites, solventes y desengrasantes industriales.",
    subcategorias: ["Grasas", "Aceites hidráulicos", "Solventes", "Desengrasantes", "Anticorrosivos"],
    emoji: "🛢️",
  },
  {
    slug: "herramientas",
    nombre: "Herramientas",
    descripcion: "Manuales, eléctricas, neumáticas y de medición.",
    subcategorias: ["Manuales", "Eléctricas", "Medición", "Corte", "Torque"],
    emoji: "🔧",
  },
  {
    slug: "neumatica",
    nombre: "Neumática e Hidráulica",
    descripcion: "Cilindros, válvulas, conexiones y mangueras.",
    subcategorias: ["Cilindros", "Válvulas", "Conexiones", "Mangueras", "FRL"],
    emoji: "💨",
  },
  {
    slug: "electrico",
    nombre: "Eléctrico y Control",
    descripcion: "Sensores, relevadores, cable, contactores y PLCs.",
    subcategorias: ["Sensores", "Relevadores", "Cable", "Contactores", "Fuentes"],
    emoji: "⚡",
  },
  {
    slug: "abrasivos",
    nombre: "Abrasivos",
    descripcion: "Discos de corte, lijas, ruedas y pulido.",
    subcategorias: ["Discos de corte", "Lijas", "Ruedas de desbaste", "Pulido"],
    emoji: "🪓",
  },
  {
    slug: "sujetadores",
    nombre: "Sujetadores",
    descripcion: "Tornillos, tuercas, rondanas y anclas.",
    subcategorias: ["Tornillos", "Tuercas", "Rondanas", "Anclas", "Remaches"],
    emoji: "🔩",
  },
  {
    slug: "sellos",
    nombre: "Sellos y Empaques",
    descripcion: "O-rings, retenes, juntas y empaquetaduras.",
    subcategorias: ["O-rings", "Retenes", "Juntas", "Empaquetaduras"],
    emoji: "⭕",
  },
  {
    slug: "filtros",
    nombre: "Filtros",
    descripcion: "Aire, hidráulicos, de coolant y de partículas.",
    subcategorias: ["Aire", "Hidráulicos", "Coolant", "Partículas"],
    emoji: "🌬️",
  },
];

export function categoriaNombre(slug: CategoriaMRO): string {
  return CATEGORIAS.find((c) => c.slug === slug)?.nombre ?? slug;
}

export function categoriaEmoji(slug: CategoriaMRO): string {
  return CATEGORIAS.find((c) => c.slug === slug)?.emoji ?? "📦";
}

export const CIUDADES: Ciudad[] = [
  "Tijuana",
  "Mexicali",
  "Ciudad Juárez",
  "Monterrey",
  "Reynosa",
  "Hermosillo",
  "Saltillo",
];

export const INDUSTRIAS: { slug: Industria; nombre: string }[] = [
  { slug: "automotriz", nombre: "Automotriz" },
  { slug: "electronica", nombre: "Electrónica" },
  { slug: "medico", nombre: "Dispositivos médicos" },
  { slug: "aeroespacial", nombre: "Aeroespacial" },
  { slug: "plasticos", nombre: "Plásticos / Inyección" },
  { slug: "metalmecanica", nombre: "Metalmecánica" },
  { slug: "alimentos", nombre: "Alimentos y bebidas" },
];

export const CERTIFICACIONES = [
  "ISO 9001",
  "IATF 16949",
  "ISO 13485",
  "AS9100",
  "NOM-138",
  "NOM-115",
  "ANSI Z87.1",
  "EN 388",
] as const;
