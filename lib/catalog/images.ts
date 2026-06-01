import type { CategoriaMRO } from "@/types";

// Fotos por categoría como default "real" del catálogo. Se pueden reemplazar
// por fotos propias en `product.imagen_url` (tiene prioridad). LoremFlickr
// devuelve fotos reales (Creative Commons) por keyword; `lock` las fija para
// que no cambien en cada carga. ProductImage cae al gradiente de marca si
// alguna no resuelve, así nunca se rompe el layout.
const f = (kw: string, lock: number) => `https://loremflickr.com/600/400/${kw}?lock=${lock}`;

export const CATEGORY_PHOTO: Record<CategoriaMRO, string> = {
  rodamientos: f("ball,bearing,metal", 21),
  epp: f("safety,gloves", 22),
  lubricantes: f("motor,oil,lubricant", 23),
  herramientas: f("industrial,tools", 24),
  neumatica: f("pneumatic,cylinder,valve", 25),
  electrico: f("circuit,board,electronics", 26),
  abrasivos: f("grinding,wheel,disc", 27),
  sujetadores: f("bolts,screws,fasteners", 28),
  sellos: f("rubber,gasket,seal", 29),
  filtros: f("air,filter", 30),
};

export function photoForProduct(categoria: CategoriaMRO, imagenUrl?: string): string | undefined {
  return imagenUrl || CATEGORY_PHOTO[categoria];
}
