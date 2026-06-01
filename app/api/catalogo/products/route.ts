import { NextResponse } from "next/server";
import { fetchProduct } from "@/lib/repos/products";

export const runtime = "nodejs";

/** Resuelve varios productos por id (para carrito/comparador en cliente). */
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 24);

  const products = (await Promise.all(ids.map((id) => fetchProduct(id)))).filter(Boolean);
  return NextResponse.json({ products });
}
