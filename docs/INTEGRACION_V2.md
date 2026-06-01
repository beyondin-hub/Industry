# Integración NOVAK v2.0 — cierre de brechas (A→B→C→D)

Integración del *Master Prompt v2.0* como **cierre de brechas sobre la base existente**,
conservando la identidad morada de Novak (no el naranja del prompt). No fue un rebuild:
se construyó encima de los ~75–80% ya existentes.

Todo es **conmutable**: funciona en modo demo sin credenciales y pasa a real al
configurar las variables de entorno correspondientes.

## Bloque A — Logística real (EnvíaYa + despachos)
- `lib/shipping/provider.ts` — interfaz `ShippingProvider` neutra al carrier.
- `lib/enviaya/client.ts` — adaptador EnvíaYa multi-carrier (real con API key, demo sin ella).
- `lib/shipping/index.ts` — `getShippingProvider()` + `selectOptimalCarrier()` (barato / rápido / balanceado).
- API: `/api/shipping/quote · /create · /webhook · /dispatch-confirm`.
- `/proveedor/despachos` — imprimir etiqueta, subir evidencia, confirmar despacho con SLA.
- `/admin/envios/nuevo` — generador manual con comparación de tarifas multi-carrier.
- Migración `0011_despachos.sql` — `dispatch_instructions` + columnas etiqueta/tracking.

**Env:** `ENVIAYA_API_KEY`, `ENVIAYA_ACCOUNT_ID`, `ENVIAYA_WEBHOOK_SECRET`.

## Bloque B — Automatización (Crons + scoring)
- `lib/scoring/engine.ts` — score 0–10 ponderado (cotización 2h, fill rate, SLA despacho, calidad)
  con consecuencias automáticas (flag<7, visibilidad reducida<6, suspensión<5).
- 7 Vercel Crons en `vercel.json` (`lib/cron/guard.ts` protege con `CRON_SECRET`):
  `check-rfq-guarantee`, `sync-tracking`, `check-dispatch-deadline`, `check-credit-expiry`,
  `check-auto-reorders`, `check-cert-expiry`, `calculate-scores`.
- `/admin/scoring` — scorecard con desglose. Panel de crons en `/admin/automatizaciones`.

**Env:** `CRON_SECRET` (Vercel lo inyecta al ejecutar los crons).

## Bloque C — Bodega / Fulfillment Hub Tijuana
- Migración `0012_bodega.sql` — `warehouse_inventory` + `warehouse_movements` + RLS.
- `/admin/bodega` — inventario consolidado (disponible = stock − reservado), alerta bajo
  mínimo, valor consignado y bitácora de movimientos.

## Bloque D — Fiscal, pagos y seguridad
- `lib/cfdi/client.ts` — CFDI 4.0 vía PAC (Facturama / SW sapien), demo en forma sin credenciales.
  `/api/cfdi/timbrar` + botón **Timbrar** en `/admin/ordenes`.
- `lib/auth/twofa.ts` — 2FA TOTP (RFC 6238) nativo. `/api/admin/2fa` + tarjeta en `/admin/config`.
- `lib/monitoring/index.ts` — captura de errores Sentry-compatible (webhook o log estructurado).
- Migración `0013_search_seguridad.sql` — `products.search_vector` (FTS español + GIN),
  `admin_2fa`, `orders.cfdi_xml_url`. Búsqueda usa `textSearch` con fallback `ilike`.
- `ProductImage` migrado a `next/image`.

**Env:** `PAC_API_URL`, `PAC_API_KEY`, `ADMIN_2FA_ENABLED`, `SENTRY_DSN` / `MONITORING_WEBHOOK_URL`.

## Vercel Cron: Hobby (gratis) vs Pro

El plan **Hobby** de Vercel solo permite crons **diarios**. Por eso `vercel.json`
usa horarios diarios para las 3 tareas que idealmente correrían más seguido
(garantía 2h, sync de rastreo, deadline de despacho).

Al subir a **Vercel Pro**, recupera la cadencia responsiva con un solo paso:

```bash
cp vercel.pro.json vercel.json && git commit -am "crons: cadencia Pro" && git push
```

`vercel.pro.json` ya trae los horarios `0 * * * *` (cada hora) y `0 */2 * * *`
(cada 2h). El panel `/admin/automatizaciones` muestra la cadencia activa (Hobby)
y, en una etiqueta morada, la cadencia "Pro" objetivo de cada tarea.

## Decisiones
- **Paleta:** se conservó el morado (`safety` #6D4AFF). Se ignoró el naranja del prompt v2.0.
- **Dominio:** se mantiene `heynovak.com` (no `novak.mx`).
- **Estrategia:** integración, no rebuild.
