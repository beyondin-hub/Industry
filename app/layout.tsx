import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MROLink — Tu equipo de compras externo para la industria maquiladora",
    template: "%s · MROLink",
  },
  description:
    "El primer broker digital de insumos MRO para la industria maquiladora del norte de México. Cotización en 2 horas, entrega 24-48h, crédito B2B y CFDI automático.",
  keywords: [
    "MRO",
    "maquiladora",
    "broker industrial",
    "insumos industriales",
    "Tijuana",
    "compras industriales",
  ],
  openGraph: {
    title: "MROLink",
    description:
      "Cotización confirmada en 2 horas hábiles o tu siguiente orden va con 0% de comisión.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
