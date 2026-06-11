import { NextResponse } from "next/server";
import { sectorProducts } from "@/lib/data/sectors";

export const runtime = "nodejs";

// Kit de Línea SMT (Electronics). Demo en memoria; en producción se
// persistiría por comprador. El cliente gestiona el estado localmente,
// estos endpoints existen para integración futura.

const DEFAULT_IDS = ["elec-ipa-99", "elec-sqg-met-12", "elec-kap-12mm", "elec-wip-lnf"];

export async function GET() {
  const items = sectorProducts("electronics")
    .filter((p) => DEFAULT_IDS.includes(p.id))
    .map((p) => ({ product_id: p.id, nombre: p.nombre, por_periodo: 4, stock_minimo: 2, reorden: true }));
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    /* opcional */
  }
  return NextResponse.json({ ok: true, persisted: false, item: body });
}

export async function PUT(req: Request) {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    /* opcional */
  }
  return NextResponse.json({ ok: true, persisted: false, item: body });
}

export async function DELETE() {
  return NextResponse.json({ ok: true, persisted: false });
}
