import Link from "next/link";
import {
  Bricolage_Grotesque,
  Hanken_Grotesk,
  Space_Grotesk,
  Inter,
  Archivo,
  Sora,
  Familjen_Grotesk,
  Onest,
  DM_Mono,
} from "next/font/google";

// Página de prueba tipográfica (no indexar). Borrar cuando se decida.
export const metadata = { title: "Prueba tipográfica · Novak", robots: { index: false } };

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--f-bricolage" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--f-hanken" });
const space = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--f-space" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--f-inter" });
const archivo = Archivo({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--f-archivo" });
const sora = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--f-sora" });
const familjen = Familjen_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--f-familjen" });
const onest = Onest({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--f-onest" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-mono" });

const VARS = [bricolage, hanken, space, inter, archivo, sora, familjen, onest, dmMono]
  .map((f) => f.variable)
  .join(" ");

const AMBER = "#D4843E";

const PAIRINGS = [
  { id: "actual", nombre: "Actual — Bricolage + Hanken", nota: "La que ya está aplicada. Orgánica, moderna, poco común, cómoda.", display: "var(--f-bricolage)", body: "var(--f-hanken)", recomendada: true },
  { id: "apple", nombre: "Minimal Apple — Sora + Onest", nota: "Tu pre-selección. Muy limpia y descansada, cercana a SF Pro, geométrica moderna.", display: "var(--f-sora)", body: "var(--f-onest)" },
  { id: "tech", nombre: "Técnica / ingeniería — Space Grotesk + Inter", nota: "Geométrica, 'tech industrial', sensación de precisión.", display: "var(--f-space)", body: "var(--f-inter)" },
  { id: "fuerza", nombre: "Fuerza / señalética — Archivo", nota: "Robusta y ancha, presencia tipo señalética industrial.", display: "var(--f-archivo)", body: "var(--f-archivo)" },
  { id: "familjen", nombre: "Alterna — Familjen Grotesk + Onest", nota: "Moderna minimal con un dejo cálido.", display: "var(--f-familjen)", body: "var(--f-onest)" },
];

export default function TipografiaPage() {
  return (
    <div className={`${VARS} min-h-screen bg-white`} style={{ color: "#151210" }}>
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
          <span className="text-lg font-bold" style={{ fontFamily: "var(--f-bricolage)" }}>
            Novak<span style={{ color: AMBER }}>.</span> <span className="text-sm font-normal text-ink-400">prueba tipográfica</span>
          </span>
          <Link href="/" className="text-sm text-ink-500 hover:text-ink-900">← Volver</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-5 px-5 py-8">
        <p className="text-sm text-ink-500">
          Mismo contenido en cada pareja tipográfica. Compara títulos, cuerpo y el código de parte (SKU).
          Dime el número de la que prefieras.
        </p>

        {PAIRINGS.map((p, i) => (
          <section key={p.id} className="rounded-2xl border p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: AMBER }}>
                {i + 1}
              </span>
              <h2 className="text-sm font-semibold text-ink-900">{p.nombre}</h2>
              {p.recomendada && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: AMBER, backgroundColor: `${AMBER}1A` }}>
                  aplicada ahora
                </span>
              )}
            </div>
            <p className="mb-5 text-xs text-ink-400">{p.nota}</p>

            {/* Specimen */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ fontFamily: p.body, color: AMBER }}>
              Novak · Marketplace MRO industrial
            </p>
            <h3 className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl" style={{ fontFamily: p.display }}>
              Cotización en 2 horas.<br />Entrega 24–48h con CFDI.
            </h3>
            <h4 className="mt-5 text-xl font-bold" style={{ fontFamily: p.display }}>
              Rodamiento de bolas SKF 6205-2RS
            </h4>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-700" style={{ fontFamily: p.body }}>
              El marketplace MRO de la maquiladora mexicana. Busca por número de parte, compara precios por
              volumen y recibe en planta en 24–48 horas. Proveedores verificados, crédito B2B y factura
              automática — para que tu línea de producción nunca se detenga por falta de un insumo.
            </p>
            <p className="mt-3 text-sm" style={{ fontFamily: "var(--f-mono)", color: "#5A5650" }}>
              SKU: ROD-SKF-6205-2RS · 847 en stock · TJ · $185 MXN/pza · desde 100: $167 (−10%)
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ fontFamily: p.body, backgroundColor: AMBER }}>
                Agregar a cotización
              </span>
              <span className="rounded-lg border px-4 py-2.5 text-sm font-semibold" style={{ fontFamily: p.body }}>
                Ver detalle
              </span>
              <span className="flex gap-4 pl-2" style={{ fontFamily: p.display }}>
                <b className="text-2xl font-extrabold">$8.4B</b>
                <b className="text-2xl font-extrabold">6,000+</b>
                <b className="text-2xl font-extrabold">&lt;2h</b>
              </span>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
