# NOVAK — Estado de la plataforma (Versión 1)

> Documento de contexto. Describe **todo lo construido** en Novak hasta hoy: qué
> es, qué hace, sus funciones, arquitectura, módulos, datos, integraciones,
> diseño y estado (real vs demo). Pensado para dar contexto completo a un
> asistente antes de pedir nuevas tareas.

---

## 1. Qué es Novak

**Novak** es un **marketplace + broker digital B2B de insumos industriales MRO**
(Maintenance, Repair & Operations) para la **industria maquiladora del norte de
México** (Tijuana y frontera). Conecta a **compradores** (departamentos de
compras de maquiladoras) con **proveedores certificados**, con Novak operando en
medio como mesa de control que garantiza servicio.

**Propuesta de valor central:**
- **Cotización garantizada en 2 horas hábiles** (o la siguiente orden va con 0% comisión).
- **Entrega 24–48h** en frontera con stock propio confirmado (top SKUs).
- **Crédito B2B** 30/60/90 días preaprobado (vía SOFOM).
- **100% proveedores certificados** (ISO 9001, IATF 16949, ISO 13485, NOM).
- **CFDI 4.0 automático** y tracking en tiempo real.
- **Protección anti-desintermediación**: Novak controla el fulfillment y enmascara contactos.
- **Catálogos especializados por sector** (NOVAK Med y NOVAK Electronics).

Dominio de producción previsto: **heynovak.com**.

---

## 2. Stack técnico

- **Framework:** Next.js 14.2 (App Router, Server Components, Route Handlers).
- **Lenguaje:** TypeScript estricto.
- **UI:** Tailwind CSS 3.4 + componentes propios estilo shadcn (Radix-like) + lucide-react (íconos) + framer-motion (animación) + recharts (gráficas).
- **Backend/DB:** Supabase (PostgreSQL + Auth + RLS). 14 migraciones SQL.
- **Validación:** Zod.
- **Integraciones:** Stripe, Twilio (WhatsApp), Resend (email), Anthropic Claude SDK, EnvíaYa (paquetería multi-carrier), PAC CFDI (Facturama / SW sapien).
- **Infra:** Vercel (deploy + Cron Jobs). puppeteer disponible (capturas). pdf-parse (lectura de facturas/listas).
- **Tamaño:** ~58 páginas, ~28 API routes, 14 migraciones.

### Arquitectura "conmutable" (clave para entender el proyecto)
**Cada integración externa degrada a modo demo si no hay credenciales.** Es
decir, toda la plataforma **funciona sin Supabase ni APIs configuradas**, usando
datos demo en memoria (`lib/data/*`). Cuando se configuran las variables de
entorno, las mismas funciones usan datos/servicios reales. Patrón: los repos
(`lib/repos/*`) intentan Supabase y caen a `lib/data/*` ante cualquier error.

- **Hoy el preview corre en MODO DEMO** (sin Supabase): los datos son los seeds en `lib/data/*`.
- Las 14 migraciones existen pero **no están aplicadas a ninguna base** todavía.

---

## 3. Roles y portales

| Rol | Quién es | Portal (prefijo de ruta) |
|-----|----------|--------------------------|
| **Público** | Visitante sin cuenta | `/`, `/productos`, `/vender` |
| **Comprador** | Maquiladora (compras/mantenimiento) | `/dashboard`, `/catalogo`, `/cotizacion`… (grupo `(dashboard)`) |
| **Proveedor** | Mayorista de insumos | `/proveedor/*` |
| **Admin** | Mesa de operaciones Novak | `/admin/*` |

- **Auth:** Supabase Auth (email/password + magic link). El rol vive en metadatos del usuario; el middleware enruta por rol; la frontera de seguridad real son las **RLS** de Supabase.
- En demo, el usuario es un comprador demo y se puede cambiar de vista (admin/proveedor) con un switcher.

---

## 4. Sitio público / Marketplace (sin login)

El sitio oficial **es un marketplace navegable sin registro** (estilo Grainger /
McMaster / Amazon Business). Los precios, stock y entrega son visibles; solo
**cotizar/comprar** pide crear cuenta.

- **`/` — Home marketplace-first:** hero con **buscador inteligente** protagonista, pills de categoría, **rieles de producto en vivo** ("Más pedidos", "Mejores precios por volumen", "En stock en Tijuana") con precio/stock/ETA/volumen reales, franja de garantía, cómo funciona, calculadora de costo de paro, proveedores verificados (scorecards), testimonios, banda a proveedores y CTA final.
- **`/productos` — Catálogo público:** grid navegable con facetas (categoría, marca, disponibilidad, precio, certificaciones, entrega) y buscador.
- **`/productos/busqueda` — Resultados de búsqueda públicos.**
- **`/productos/[id]` — Ficha de producto pública (PDP):** imagen, specs técnicas, certificaciones, **tabla de precios por volumen**, stock exacto + ETA, social proof, documentación (gated), productos relacionados. CTA "Crear cuenta para cotizar". **SEO:** SSG (`generateStaticParams`), metadata OpenGraph/Twitter/canonical, **JSON-LD `schema.org/Product`**. Hay `sitemap.xml` y `robots.txt`.
- **Header público:** logo, **mega-menú "Catálogo"** (categorías + catálogos especializados), buscador integrado (desktop inline + fila en móvil), **menú móvil (drawer)**, accesos a login/registro/WhatsApp.
- **`/vender` y `/vender/registro`:** landing y alta de proveedores (wizard).
- **`/login`, `/registro`:** auth.

### Buscador inteligente (SmartSearch)
Dropdown en vivo (debounce 250ms) con: búsquedas recientes (localStorage),
**coincidencia exacta por número de parte**, productos sugeridos, categorías
relacionadas y "ver todos". Reutilizable en público (`/productos/*`) y portal
(`/catalogo/*`) vía prop `basePath`. API: `/api/catalogo/search` (modo
`suggest` + búsqueda completa con filtros y orden server-side).

---

## 5. Portal del Comprador (grupo `(dashboard)`)

Portal con sidebar + topbar (buscador + carrito + notificaciones + sector).

**Páginas:**
- **`/dashboard`** — KPIs (RFQ activos con countdown SLA, órdenes en curso, crédito disponible, gasto del mes), gráfica de gasto, **alertas inteligentes** (contextuales al sector), cotizaciones en curso, reorden automático, órdenes recientes con tracking, recompra rápida. **Banner de identidad sectorial** si hay sector configurado.
- **`/catalogo`** — Homepage del catálogo interno estilo Amazon (compra de nuevo, categorías con conteo, ofertas por volumen, vistos recientemente).
- **`/catalogo/busqueda`** — SERP con facetas.
- **`/catalogo/[id]`** — PDP interno con **buy box** (precio dinámico por cantidad, opción de **reorden −5%**, agregar a cotización, comparar, watchlist), tabs de specs, gráfica de historial de precio, relacionados, recién vistos.
- **`/catalogo/comparar`** — Comparador lado a lado (hasta 4 productos).
- **`/catalogo/importar`** — Importar lista de compra (CSV) → machea contra catálogo (encontrados/similares/no encontrados) → agrega todo a cotización.
- **`/catalogo/sector/[sector]`** y **`/catalogo/sector/[sector]/producto/[id]`** — Catálogo y ficha **sectoriales** (ver módulo Sectores).
- **`/cotizar`** — Constructor manual de RFQ (partidas, número de parte, foto, cantidad, urgencia, condición de pago, CFDI).
- **`/cotizacion`** — **Carrito de cotización**: edita cantidades, condición de pago (contado/30/60), urgencia; calcula subtotal + recargo + IVA; envía vía `/api/rfq`.
- **`/cotizaciones`** — Bandeja de cotizaciones recibidas.
- **`/ordenes`** — Historial/tracking de órdenes (estado, ETA, CFDI, recompra).
- **`/credito`** — Línea de crédito (límite/usado/disponible), solicitar aumento.
- **`/reordenes`** — Reórdenes automáticas (Subscribe & Save con descuento).
- **`/listas`** — Listas de compra guardadas (estilo Grainger).
- **`/analytics`** — Gasto por categoría/proveedor/mes.
- **`/quick-order`** — Recompra rápida por número de parte.
- **`/notificaciones`** — Alertas (web/WhatsApp/email).
- **`/perfil`** — Empresa, equipo (multi-usuario con roles y umbrales de aprobación).
- **`/guias/[sector]`, `/guias/[sector]/[slug]`** — Guías técnicas por sector.
- **`/herramientas/auditoria`** — Kit de Auditoría (Med).
- **`/herramientas/linea-smt`** — Kit de Línea SMT (Electronics).

**Carrito/estado en cliente (demo):** carrito de cotización, comparador,
watchlist y "vistos recientemente" viven en **localStorage** (`lib/catalog/store.tsx`)
porque aún no hay tablas en DB para esto. Indicador de carrito en el topbar y
barra flotante de comparación.

---

## 6. Módulo Sectores (NOVAK Med + NOVAK Electronics)

Experiencia diferenciada por industria sobre la misma base de código. Dos
verticales en el MVP: **NOVAK Med** (dispositivos médicos, teal) y **NOVAK
Electronics** (manufactura electrónica/SMT, azul pizarra).

- **Onboarding `/onboarding/sector`:** al entrar al portal sin sector configurado, el comprador elige sector (o "manufactura general"). Persiste en cookie (demo) y en `buyers.sector_id` (live).
- **Dashboard sectorial:** banner de identidad, alertas y "quick order" contextuales; bloque "Mi Sector" en sidebar; badge de sector en topbar.
- **Catálogo sectorial** (`/catalogo/sector/[sector]`): hero, **filtros técnicos por sector** (Med: certificación, clase de cuarto limpio, características; Electronics: estándar ESD, resistencia, RoHS/IPC), tarjetas con badges de certificación, **PDP sectorial** con tabla de specs técnicas, documentación y usos recomendados.
- **24 productos demo** por sector (12+12) con atributos técnicos, badges y documentos.
- **Guías técnicas** por sector (con contenido real en markdown).
- **Herramientas diferenciales:**
  - **Kit de Auditoría (Med):** selecciona período y documentos → genera carpeta ZIP (CFDI + COA + certificaciones) — gated al sector médico.
  - **Kit de Línea SMT (Electronics):** configura consumibles de la línea (cantidad, stock mínimo, reorden automático), alertas y cotización de un clic — gated al sector electrónico.
- **APIs:** `/api/sectors/list`, `/api/sectors/[slug]/{categories,products,guides}`, `/api/buyer/sector` (GET/PUT), `/api/buyer/audit-kit`, `/api/buyer/smt-kit`.
- **Datos:** migración `0014_sectores.sql` (`industry_sectors`, `sector_categories`, `product_sectors`, `sector_guides`, columnas de sector en `buyers`, RLS) + capa demo `lib/data/sectors.ts`.

---

## 7. Portal del Proveedor (`/proveedor/*`)

- **`/proveedor/dashboard`** — RFQs entrantes (con identidad del comprador **enmascarada**), ventas, plan de membresía.
- **`/proveedor/productos`** — CRUD de catálogo; importación masiva por CSV/factura PDF; enriquecimiento con IA (Claude parsea specs).
- **`/proveedor/despachos`** — Tablero de despacho: imprimir etiqueta, subir evidencia, confirmar envío, medición de SLA.
- **`/proveedor/mensajes`** — Mensajería mediada (contacto enmascarado, ruteada por Novak).
- **`/proveedor/perfil`** — Datos, KYC, certificaciones (ISO/IATF/NOM), bancarios.

---

## 8. Panel Admin / Mesa de Operaciones (`/admin/*`)

- **`/admin/dashboard`** — KPIs de operación.
- **`/admin/rfq`** — Matching de RFQs (board con countdown SLA 2h, sugerencia de proveedores calificados, ruteo).
- **`/admin/cotizador`** — Constructor manual de cotizaciones (tiers de precio, condición de pago, formato CFDI).
- **`/admin/proveedores`** y **`/admin/proveedores/[id]`** — Lista, aprobación KYC, blacklist, perfil con historial y score.
- **`/admin/scoring`** — Scorecard 0–10 ponderado (cotización 2h, fill rate, SLA despacho, calidad) con consecuencias automáticas.
- **`/admin/compradores`** — Directorio de empresas compradoras, límites, KYC.
- **`/admin/ordenes`** — Fulfillment global, transiciones de estado, botón **Timbrar CFDI**.
- **`/admin/envios`** y **`/admin/envios/nuevo`** — Torre de control de envíos + generador manual con comparación de tarifas multi-carrier.
- **`/admin/bodega`** — Inventario Hub Tijuana (disponible = stock − reservado), alertas de mínimo, valor consignado, bitácora.
- **`/admin/credito`** — Aprobación de líneas, exposición, calendario de pagos.
- **`/admin/tesoreria`** — Conciliación de pagos, aging.
- **`/admin/finanzas`** — Ingresos, costos, GMV por proveedor/categoría.
- **`/admin/automatizaciones`** — Panel de Crons (cadencia activa + objetivo Pro).
- **`/admin/auditoria`** — Bitácora de cambios.
- **`/admin/config`** — Comisión, sobrecargos, fees, 2FA TOTP.
- **`/admin/soporte`** — Cola de soporte.
- **`/admin/cms`** — Contenido del sitio (banner, hero, plantillas).
- **`/admin/equipo`** — Miembros, roles, permisos.
- **`/admin/catalogo`** — Gestión de catálogo.

---

## 9. Motores de negocio (`lib/`)

- **SLA** (`lib/rfq/sla.ts`): deadline de 2h **hábiles** (excluye fines de semana y feriados MX).
- **Scoring** (`lib/scoring/engine.ts`): score 0–10 ponderado + niveles (elite/bueno/observación/riesgo/crítico) + consecuencias (flag, visibilidad reducida, suspensión).
- **Crédito** (`lib/credit/engine.ts`): cálculo de límite por antigüedad/GMV/industria, términos 30/60/90, exposición, comisión (12% + IVA). *(Hoy el scoring SOFOM es determinístico/demo.)*
- **Pricing** (`lib/pricing/`): precios escalonados por volumen.
- **Search** (`lib/search/industrial.ts`): full-text español (tsvector/GIN) con fallback ILIKE, sinónimos (balero↔rodamiento), ranking por número de parte/marca/specs.
- **Catálogo / señales de conversión** (`lib/catalog/signals.ts`): stock exacto (escasez), **ETA con corte 2 PM Tijuana**, salto de precio por volumen, precio por cantidad, social proof determinístico.
- **Logística** (`lib/logistics/`): zonas, ETA por zona (frontera 24h / interior 48h), ruteo.
- **Anti-bypass** (`lib/anti-bypass.ts`): protección anti-desintermediación.
- **Monitoring** (`lib/monitoring/`): captura de errores compatible con Sentry/webhook.

---

## 10. Integraciones externas (todas conmutables real/demo)

| Servicio | Uso | Archivo |
|----------|-----|---------|
| **Supabase** | Auth + DB + RLS | `lib/supabase/*` |
| **Stripe** | Membresías de proveedor | `lib/stripe/client.ts` |
| **EnvíaYa** | Paquetería multi-carrier (Estafeta, FedEx, Paquetexpress, Tres Guerras): tarifas, guías, tracking, webhook | `lib/enviaya/client.ts`, `lib/shipping/*` |
| **Twilio** | WhatsApp (RFQ, cotización lista, tránsito, crédito, aprobación proveedor) | `lib/twilio/whatsapp.ts` |
| **Resend** | Email (plantillas HTML) | `lib/resend/email.ts` |
| **Claude (Anthropic)** | Chatbot/asistente, enriquecimiento de productos desde factura/PDF | `lib/claude/*` |
| **PAC CFDI 4.0** | Timbrado (Facturama / SW sapien): UUID + XML + PDF | `lib/cfdi/client.ts` |

---

## 11. Automatización — Vercel Cron (7 jobs)

Protegidos con `CRON_SECRET`. **En plan Hobby corren diario**; hay
`vercel.pro.json` con la cadencia responsiva (cada hora / 2h) para cuando se
suba a Pro (un `cp` lo activa).

- `check-rfq-guarantee` — RFQs sin cotizar tras el deadline 2h → activa beneficio 0% comisión.
- `sync-tracking` — actualiza envíos en tránsito (EnvíaYa).
- `check-dispatch-deadline` — marca despachos vencidos.
- `check-credit-expiry` — recordatorio/vencimiento de crédito.
- `check-auto-reorders` — dispara reórdenes programadas.
- `check-cert-expiry` — avisa certificaciones por vencer (30 días).
- `calculate-scores` — recálculo mensual de scoring.

---

## 12. Modelo de datos (migraciones Supabase)

`0001_init` (núcleo: companies, buyers, providers, products, price_tiers, rfqs,
rfq_items, quotations, orders, auto_reorders, shopping_lists, spend_analytics,
notifications, price_history) · `0002_rls` (RLS multi-tenant + helpers
`auth_company_id()`, `is_mrolink_admin()`) · `0003_seed` · `0004_marketplace`
(provider_users, messages con enmascarado) · `0005_credito` (payments,
credit_requests) · `0006_tesoreria` · `0007_gobierno` · `0008_soporte_config` ·
`0009_cms_automatizaciones` · `0010_logistica` (shipments, shipment_events) ·
`0011_despachos` (dispatch_instructions) · `0012_bodega` (warehouse_inventory,
warehouse_movements) · `0013_search_seguridad` (search_vector FTS+GIN, admin_2fa,
orders.cfdi_xml_url) · `0014_sectores` (industry_sectors, sector_categories,
product_sectors, sector_guides, columnas de sector en buyers).

> **Pendiente:** no hay tablas para carrito/watchlist/comparador/recién-vistos
> (hoy en localStorage); sería una migración `0015` al conectar Supabase.

---

## 13. APIs (Route Handlers)

RFQ (`/api/rfq`) · Shipping (`/api/shipping/{quote,create,webhook,dispatch-confirm}`)
· CFDI (`/api/cfdi/timbrar`) · 2FA (`/api/admin/2fa`) · Mensajes (`/api/messages`)
· IA (`/api/ai-assistant`, `/api/enrich-product`, `/api/parse-pdf`) · Sectores
(`/api/sectors/*`, `/api/buyer/{sector,audit-kit,smt-kit}`) · Catálogo
(`/api/catalogo/{search,products,import-list}`) · 7 Crons (`/api/cron/*`).

---

## 14. Sistema de diseño (identidad visual actual)

Refresh reciente: **neutral cálido estilo Apple**, que destaquen los productos y
no el cromo del sitio.

- **Fondo:** blanco. **Escalas neutras cálidas:** void `#0A0908`, carbon `#151210`, graphite `#1E1C1A`, iron `#1A1A1A`, steel `#5A5650`, pearl `#E8E4DC`.
- **CTA / acción:** **gris plomo/grafito `#3D3833`** (no negro sólido).
- **Acento cálido SUTIL:** **bronce `#6B5D4F`** solo en lo más relevante (punto del logo, datos clave).
- **Ámbar `#D4843E`:** reservado, usado en **solo 2 puntos** (badge "cotización 2h" del hero y realce "sin comisión" del cierre).
- **Sin morado ni magenta** (se eliminaron de toda la plataforma).
- **Tipografía:** **Sora** (títulos) + **Onest** (cuerpo) + **DM Mono** (SKUs) — estilo "Minimal Apple", cómoda y descansada.
- Tokens centralizados en `tailwind.config.ts` y `app/globals.css` (cambiar el tema = cambiar tokens, no componentes).
- **Imágenes de producto:** soporte real vía `imagen_url`; default por categoría (foto real por keyword) con fallback seguro a placeholder de marca.

---

## 15. Estado: real vs demo, y pendientes conocidos

**Funciona end-to-end en demo** (sin credenciales): navegación pública,
onboarding de sector, catálogo, búsqueda, carrito→cotización, importar lista,
comparador, kits sectoriales, portales.

**Para producción falta:**
- Conectar **Supabase** (aplicar migraciones `0011`–`0014`, y crear `0015` para carrito/watchlist) y poblar `product_sectors`.
- Configurar variables de entorno reales: `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_*`, `TWILIO_*`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `ENVIAYA_*`, `PAC_API_URL/KEY`, `CRON_SECRET`, `ADMIN_2FA_ENABLED`, `SENTRY_DSN`/`MONITORING_WEBHOOK_URL`, `NEXT_PUBLIC_APP_URL`.
- **Crédito SOFOM** real (hoy determinístico/demo) — es la mayor palanca de diferenciación pendiente.
- **Sin tests automatizados ni CI** todavía.
- Pendientes opcionales: búsqueda por imagen (Claude) en catálogo, `product_metrics` (social proof real), parseo `.xlsx`, fotografía real por SKU, fotos reales de producto subidas por proveedor.
- Nota técnica: `notFound()` en rutas anidadas del portal renderiza el UI 404 con status 200 (quirk de Next en `next start`); el aislamiento de datos sí se respeta. Las rutas públicas `/productos/[id]` sí devuelven 404 real.

---

## 16. Despliegue y repositorio

- **Repo:** `beyondin-hub/industry`.
- **Rama de trabajo:** `claude/mrolink-mvp-architecture-aCmEu`.
- **PR:** #1 (abierto contra `main`) con todo el trabajo descrito.
- **Deploy:** Vercel (proyecto `novak`). Producción despliega solo desde `main` (`vercel.json` → `deploymentEnabled: { main: true }`); el PR genera **preview** por commit.
- **Comandos:** `npm run dev` / `npm run build` / `npm run start`.

---

## 17. Estructura de carpetas (resumen)

```
app/
  (auth)/            login, registro
  (dashboard)/       portal comprador (catalogo, cotizacion, sectores, guias, herramientas…)
  (proveedor)/       portal proveedor
  (admin)/           mesa de operaciones
  productos/         marketplace PÚBLICO (browse, busqueda, [id])
  onboarding/sector  selector de sector
  api/               route handlers (rfq, shipping, cfdi, sectors, catalogo, cron…)
  page.tsx           home pública (marketplace), layout.tsx, sitemap.ts, robots.ts
components/
  catalog/ marketing/ dashboard/ admin/ proveedor/ sector/ ui/ shared/ …
lib/
  repos/   (acceso a datos con fallback demo)
  data/    (seeds demo en memoria)
  catalog/ sector/ scoring/ credit/ pricing/ search/ logistics/ rfq/
  enviaya/ twilio/ resend/ claude/ cfdi/ stripe/ supabase/ auth/ monitoring/
  constants.ts utils.ts validations.ts anti-bypass.ts
supabase/migrations/  0001 … 0014
types/index.ts        tipos de dominio
tailwind.config.ts, app/globals.css   sistema de diseño (tokens)
vercel.json, vercel.pro.json          crons (Hobby/Pro)
```

---

*Novak v1 — documento de estado. Modo actual: demo conmutable, listo para
conectar Supabase + integraciones reales para producción.*
