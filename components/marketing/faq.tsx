"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "¿Cuánto cuesta vender en Novak?",
    a: "Nada por adelantado. $0 de alta y $0 de mensualidad. Solo cobramos una comisión por transacción (8–12%) cuando cierras una venta. Los servicios avanzados (financiamiento, fulfillment, entrega) son opcionales y solo aplican si los activas.",
  },
  {
    q: "¿Quién pone el crédito a la maquiladora?",
    a: "Novak. Nosotros otorgamos y financiamos la línea de crédito a la maquila vía nuestro partner SOFOM y asumimos el riesgo de cobranza. Tú no te expones a cuentas incobrables.",
  },
  {
    q: "¿Cómo y cuándo me pagan?",
    a: "Tú le facturas a Novak (no a la maquila) y te pagamos según el plazo que pactes en tu alta (contado, 15, 30 o 45 días). Recibes el pago a la CLABE que registres, aunque la maquila pague a 60 o 90 días.",
  },
  {
    q: "¿Tengo que mandar mi inventario a Novak?",
    a: "No es obligatorio. Eliges cómo cumplir: Fulfillment Novak (mandas inventario a nuestro almacén en Tijuana para entregas 24-48h), Dropshipping (conservas tu inventario y nosotros coordinamos la recolección) o Entrega directa gestionada por Novak.",
  },
  {
    q: "¿Qué pasa con mis clientes actuales? ¿Pierdo la relación?",
    a: "No. Novak te trae demanda nueva de compradores verificados. La relación comercial y de cobro de esas ventas la administra Novak para protegerte el cobro; tus clientes directos siguen siendo tuyos.",
  },
  {
    q: "¿Puedo contactar directamente al comprador?",
    a: "La comunicación se hace dentro de la plataforma y de forma mediada por Novak. La identidad y los datos de contacto del comprador se mantienen protegidos para cuidar la relación de ambos lados.",
  },
  {
    q: "¿Qué necesito para aplicar?",
    a: "Datos fiscales (RFC), tus categorías y certificaciones, cómo quieres entregar y una CLABE para recibir pagos. El alta toma menos de 10 minutos y puedes explorar la plataforma de inmediato.",
  },
  {
    q: "¿Cualquiera puede vender? ¿Cómo es la aprobación?",
    a: "No. Novak es selectivo: al registrarte envías una solicitud y tu cuenta queda en revisión. Validamos tus datos fiscales y certificaciones (normalmente 24–48h hábiles). Al aprobarte, activamos tu catálogo para empezar a vender.",
  },
  {
    q: "¿Qué productos puedo vender?",
    a: "Insumos MRO industriales: rodamientos, EPP, lubricantes, herramientas, neumática, eléctrico, abrasivos, sujetadores, sellos y filtros, entre otros. Subes tu catálogo con ayuda de IA en minutos.",
  },
  {
    q: "¿Necesito emitir CFDI?",
    a: "Le facturas a Novak con CFDI por tus ventas. Novak emite el CFDI correspondiente a la maquiladora. Todo el flujo fiscal queda ordenado.",
  },
  {
    q: "¿Hay exclusividad o permanencia forzada?",
    a: "No hay permanencia ni cuota. Aceptas una cláusula de no-circunvención (no vender directo a los compradores que conoces a través de Novak), pero puedes operar con tus demás clientes con total libertad.",
  },
  {
    q: "¿Cuántos cupos hay para fundadores?",
    a: "Estamos incorporando un grupo limitado de proveedores fundadores con comisión preferente, prioridad en RFQs y acompañamiento 1 a 1. Por eso el proceso es por solicitud y aprobación.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y rounded-2xl border bg-card">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-ink-900">{f.q}</span>
              <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", isOpen ? "bg-safety text-white" : "bg-secondary text-ink-600")}>
                {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
              </span>
            </button>
            {isOpen && <p className="px-5 pb-5 text-sm leading-relaxed text-ink-600">{f.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
