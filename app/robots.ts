import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://heynovak.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas privadas / de aplicación fuera del índice.
      disallow: ["/admin", "/dashboard", "/proveedor", "/cotizacion", "/api"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
