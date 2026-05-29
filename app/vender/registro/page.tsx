import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { OnboardingWizard } from "@/components/proveedor/onboarding-wizard";

export const metadata = { title: "Alta de proveedor" };

export default function ProveedorRegistroPage() {
  return (
    <div className="min-h-screen bg-paper-300">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <Link href="/vender" className="text-sm font-medium text-ink-600 hover:text-safety">
            ← Volver
          </Link>
        </div>
      </header>
      <main className="container py-10">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-950">
            Conviértete en proveedor de Novak
          </h1>
          <p className="mt-2 text-ink-600">
            Sin cuota de entrada ni mensualidad. El alta toma menos de 10 minutos.
          </p>
        </div>
        <OnboardingWizard />
      </main>
    </div>
  );
}
