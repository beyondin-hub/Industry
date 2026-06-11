import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/data/products";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://heynovak.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const estaticas = ["", "/productos", "/vender", "/login", "/registro"].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const fichas = PRODUCTS.map((p) => ({
    url: `${BASE}/productos/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...estaticas, ...fichas];
}
