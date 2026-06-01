import { fetchSectors } from "@/lib/repos/sectors";
import { SectorSelector } from "@/components/sector/sector-selector";

export const metadata = { title: "Configura tu industria · Novak" };

export default async function OnboardingSectorPage() {
  const sectors = await fetchSectors();
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-12">
      <header className="mb-10 text-center">
        <div className="mb-6 text-2xl font-black tracking-tight text-white">
          NOVAK
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-safety">
          Configura tu experiencia
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          ¿En qué industria opera tu empresa?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-paper-100/60">
          Personalizamos tu catálogo, filtros y documentación según tu sector.
          Puedes cambiarlo en cualquier momento.
        </p>
      </header>

      <SectorSelector sectors={sectors} />
    </div>
  );
}
