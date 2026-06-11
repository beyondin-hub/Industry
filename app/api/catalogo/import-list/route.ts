import { NextResponse } from "next/server";
import { fetchProducts } from "@/lib/repos/products";
import type { Product } from "@/types";

export const runtime = "nodejs";

interface Row {
  descripcion?: string;
  numero_parte?: string;
  cantidad?: number;
  unidad?: string;
}

function norm(s: string) {
  return (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[-\s]/g, "");
}
function slim(p: Product) {
  return { id: p.id, nombre: p.nombre, numero_parte: p.numero_parte, marca: p.marca, precio_base: p.precio_base, unidad: p.unidad, stock_actual: p.stock_actual };
}

/** Importa una lista de compra y la machea contra el catálogo. */
export async function POST(req: Request) {
  let rows: Row[] = [];
  try {
    rows = ((await req.json()) as { rows?: Row[] }).rows ?? [];
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const catalog = await fetchProducts();
  const encontrados: { row: Row; product: ReturnType<typeof slim> }[] = [];
  const similares: { row: Row; product: ReturnType<typeof slim> }[] = [];
  const no_encontrados: Row[] = [];

  for (const row of rows.slice(0, 200)) {
    const np = norm(row.numero_parte ?? "");
    const desc = norm(row.descripcion ?? "");
    const exact = np ? catalog.find((p) => norm(p.numero_parte) === np) : undefined;
    if (exact) {
      encontrados.push({ row, product: slim(exact) });
      continue;
    }
    const similar = catalog.find((p) => {
      const pn = norm(p.numero_parte);
      const pname = norm(p.nombre);
      return (np && (pn.includes(np) || np.includes(pn))) || (desc && pname.includes(desc.slice(0, 8)));
    });
    if (similar) similares.push({ row, product: slim(similar) });
    else no_encontrados.push(row);
  }

  return NextResponse.json({ encontrados, similares, no_encontrados });
}
