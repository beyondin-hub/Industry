import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

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
    <html lang="es-MX" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
