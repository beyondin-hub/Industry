import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://heynovak.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Áreas privadas / de aplicación fuera del índice. Los route groups no
      // agregan segmento, así que las páginas autenticadas viven en la raíz.
      disallow: [
        "/admin",
        "/dashboard",
        "/proveedor",
        "/api",
        "/catalogo",
        "/cotizar",
        "/cotizacion",
        "/cotizaciones",
        "/ordenes",
        "/credito",
        "/analytics",
        "/perfil",
        "/listas",
        "/reordenes",
        "/notificaciones",
        "/quick-order",
        "/herramientas",
        "/guias",
        "/onboarding",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
