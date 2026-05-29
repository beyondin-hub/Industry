# Oferta y experiencia del Proveedor — Novak

Referencias de diseño: Amazon Business, Alibaba, Uline, Walmart Business (merchant portals).

## 1. Propuesta de valor
- **$0 de alta, $0 de mensualidad.** Solo comisión por transacción (8–12% del GMV).
- **Novak pone el crédito:** otorga la línea a la maquiladora y le paga al proveedor.
  El proveedor **le factura a Novak**, no a la maquila → cero cuentas incobrables.
- **Demanda calificada** vía RFQs de compradores verificados, sin equipo de ventas.
- **Cumplimiento flexible:** Fulfillment Tijuana, Dropshipping o Entrega directa gestionada.
- **Programa de Proveedores Fundadores:** prioridad en RFQs, comisión preferente, onboarding 1 a 1.

## 2. Modelo de ingresos para Novak (`lib/pricing/provider.ts`)
| Fuente | Valor | Tipo |
|--------|-------|------|
| Comisión por transacción | 8–12% | base |
| Financiamiento Novak (crédito a la maquila) | +2–4% | opcional |
| Fulfillment Tijuana | desde 3% | opcional |
| Entrega directa gestionada | fee por orden | opcional |
| Catálogo extendido (> 300 SKUs) | plan por volumen | opcional |
| Visibilidad destacada en RFQs | opcional | opcional |
| Inteligencia de mercado | suscripción | opcional |

Filosofía: Novak gana cuando el proveedor gana más; los fees son por servicios que el proveedor activa.

## 3. Anti-desintermediación (`lib/anti-bypass.ts`)
Defensa en capas para que el proveedor no "brinque" y venda directo a la maquila:
1. **Identidad del comprador enmascarada** — el proveedor solo ve
   "Comprador verificado · {industria} · {ciudad}" (`maskBuyer`). Nunca nombre, RFC, contacto ni dirección.
2. **Comunicación 100% en plataforma** — `redactContact()` borra teléfonos, emails y URLs de los mensajes.
3. **Novak es la relación fiscal y de crédito** — el proveedor factura a Novak y Novak cobra/financia a la maquila. Sin datos del cliente final, el brinco es estructuralmente difícil.
4. **Cláusula de no-circunvención** aceptada en el alta (no contacto/venta directa durante vigencia + 12 meses).
5. **Fulfillment/entrega por Novak** — en esos modos el proveedor no conoce la dirección de entrega (va al almacén Novak o lo despacha Novak).

## 4. Onboarding self-service (`/vender/registro`)
Wizard de 5 pasos: Negocio (fiscal) → Categorías/Certificaciones → Cumplimiento (fulfillment/cobertura) → Cobro y crédito (CLABE, aceptar financiamiento, plazo) → Confirmar (términos + no-circunvención). Sin fricción; el proveedor valida y aprueba.

## 5. Carga de productos asistida por IA (`/proveedor/productos`)
- **Importar con IA:** pega tu lista o sube CSV/TXT → `/api/enrich-product` estructura y
  enriquece cada ficha (marca, N/P, categoría, specs, descripción, certificaciones).
  Usa Claude si hay `ANTHROPIC_API_KEY`; si no, enriquecimiento heurístico. El proveedor revisa, ajusta precio y publica.
- **Manual (1 a 1):** alta producto por producto.
- Objetivo: cero fricción tipo Amazon — el proveedor no batalla para subir su catálogo.

## 6. Páginas
- `/vender` — landing 100% para proveedores (conversión a alta).
- `/vender/registro` — onboarding self-service.
- `/proveedor/dashboard` — portal: RFQs (comprador enmascarado), plan/modelo, catálogo.
- `/proveedor/productos` — carga asistida por IA + manual.
