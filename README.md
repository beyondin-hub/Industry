# MROLink 🔧

> **Tu equipo de compras externo para la industria maquiladora.**
> El primer broker digital especializado en insumos MRO (mantenimiento, reparación
> y operaciones) para la industria maquiladora del norte de México.

> _"Ninguna línea de producción debería parar por un problema de suministro
> resoluble en horas."_

---

## 🎯 Propuesta de valor

| Pilar | Promesa |
|-------|---------|
| ⏱️ **Velocidad** | Cotización confirmada en **menos de 2 horas hábiles** |
| 🚚 **Entrega** | **24–48h** en top SKUs con stock propio confirmado |
| 💳 **Crédito** | Línea B2B preaprobada a **30/60/90 días** en 24h (vía SOFOM partner) |
| 🛡️ **Calidad** | Proveedores **100% certificados** (ISO 9001, IATF 16949, NOM) |
| 🧾 **Fiscal** | **CFDI automático** en cada transacción |
| 💬 **Canal** | Un solo número de **WhatsApp** + plataforma para todo MRO |

### 🐮 Garantía Purple Cow
**"Cotización confirmada en 2 horas hábiles o tu siguiente orden va con 0% de comisión."**

---

## 🧱 Stack técnico

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Estilos:** Tailwind CSS + componentes UI propios (estilo shadcn)
- **Base de datos:** Supabase (PostgreSQL) con Row Level Security
- **Auth:** Supabase Auth (magic link + email/password)
- **Pagos:** Stripe (membresías de proveedores)
- **WhatsApp:** Twilio API (notificaciones y alertas)
- **Email:** Resend (CFDI, cotizaciones, confirmaciones)
- **AI:** Claude API (asistente de compras integrado)
- **Deploy:** Vercel (frontend) + Supabase (backend)

> **Modo demo:** la app corre **sin credenciales**. Todas las integraciones
> (Supabase, Stripe, Twilio, Claude) degradan elegantemente a datos de
> demostración (`lib/data`) y respuestas locales. Configura `.env` para activarlas.

---

## 🚀 Empezar

```bash
npm install
cp .env.example .env.local   # opcional: añade tus credenciales
npm run dev                  # http://localhost:3000
```

Comandos:

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run start      # servir build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

---

## 🗺️ Mapa de la aplicación

### Público
- `/` — Landing page (hero, búsqueda instantánea, disponibilidad en vivo, comparativa, garantía)
- `/login`, `/registro` — Autenticación (comprador / proveedor)
- `/catalogo` — Catálogo MRO con filtros por categoría y búsqueda Quick-Order
- `/catalogo/[id]` — Ficha de producto (specs técnicas, precios por volumen, ficha/CAD)

### Comprador (dashboard)
- `/dashboard` — KPIs, RFQ activos con countdown SLA, órdenes, recompra rápida, reorden auto
- `/cotizar` — Sistema **RFQ** multi-partida (con foto del componente, urgencia, crédito, CFDI)
- `/ordenes` — Tracking en vivo + historial + CFDI + recompra 1-clic
- `/analytics` — **Spend visibility** (gasto por categoría/mes, top proveedores)
- `/listas` — Listas de compra reutilizables (Grainger Lists)
- `/reordenes` — Reorden automático con descuento (Subscribe & Save B2B)
- `/perfil` — Empresa, equipo multiusuario, roles y flujos de aprobación por monto

### Operaciones MROLink
- `/proveedor/dashboard` — Portal de proveedor: RFQ entrantes, catálogo, ventas, membresía
- `/admin/rfq` — **Mesa de operaciones**: SLA 2h, matching y asignación de proveedores

### API
- `POST /api/rfq` — Crea RFQ y calcula deadline de horas hábiles
- `POST /api/ai-assistant` — Asistente de compras con Claude (fallback local)

---

## 🏆 Benchmark implementado

Inspirado en los mejores B2B del mundo:

- **Grainger** — Quick Order por SKU, recompra desde historial, precios por cuenta,
  listas, ficha técnica PDF, disponibilidad en vivo, roles de acceso.
- **Amazon Business** — Flujos de aprobación por monto, cuentas multiusuario,
  spend analytics, Pay-by-Invoice (Net 30/60/90), reorden automático, descuentos por cantidad.
- **Alibaba B2B** — RFQ masivo, matching por especificación, badges de verificación,
  consulta de múltiples productos, centro de comunicación.
- **Uline** — Precios sin login, mínima fricción, indicadores de envío, price breaks en tabla.
- **McMaster-Carr** — Búsqueda por especificación técnica, taxonomía profunda,
  tabla de specs completa, archivos CAD, resultados instantáneos.
- **MSC Direct** — Mobile-first, recomendaciones ("otros compradores también vieron"),
  catálogo personalizado, soporte técnico por chat.

---

## 🗄️ Base de datos

Migraciones en `supabase/migrations/`:

1. `0001_init.sql` — Esquema completo (companies, buyers, providers, products,
   price_tiers, rfqs, rfq_items, quotations, orders, auto_reorders, shopping_lists,
   spend_analytics, notifications, price_history).
2. `0002_rls.sql` — Row Level Security multi-tenant (aislamiento por empresa,
   catálogo público, rol admin de MROLink).
3. `0003_seed.sql` — Catálogo semilla (proveedores y productos del norte de México).

Aplicar con la CLI de Supabase:

```bash
supabase db push
# o ejecuta los .sql en el SQL Editor del proyecto
```

---

## 📁 Estructura

```
app/
  (auth)/          login, registro
  (dashboard)/     dashboard, catalogo, cotizar, ordenes, analytics,
                   listas, reordenes, perfil, proveedor/, admin/
  api/             rfq, ai-assistant
  page.tsx         landing pública
components/
  ui/              primitivos (button, card, badge, input, select…)
  marketing/       header y footer públicos
  dashboard/       sidebar, topbar, stat-card, page-header
  catalog/         product-card, product-buybox
  rfq/             rfq-form
  ai-chat/         assistant (widget flotante)
  shared/          logo, status-badge
lib/
  supabase/        clientes browser/server
  claude/          asistente IA + system prompt
  stripe/          membresías de proveedor
  twilio/          notificaciones WhatsApp
  rfq/             cálculo de SLA en horas hábiles
  data/            dataset de demostración
  constants.ts     marca, taxonomía, ciudades, certificaciones
  utils.ts         formato MXN, fechas, comisión, price tiers
types/             tipos de dominio
supabase/migrations/  esquema + RLS + seed
```

---

## 💰 Modelo de ingresos

1. **Comisión** 8–15% del GMV por transacción (día 1)
2. **Membresía proveedores** $2,500–8,000 MXN/mes (mes 3)
3. **BNPL Industrial** 2–4% por órdenes financiadas (mes 6)
4. **Inteligencia de mercado** reportes de demanda (mes 12)

---

Hecho para la industria maquiladora del norte de México 🇲🇽
Tijuana · Mexicali · Ciudad Juárez · Monterrey
