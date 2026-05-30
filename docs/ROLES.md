# Roles y módulos por cuenta — Novak

Cada usuario ve **solo** los módulos de su rol. La separación es por:
1. **Shell propio** por rol (route group con su layout y sidebar).
2. **Navegación** definida en `components/dashboard/nav-items.ts` (fuente única).
3. **Protección de rutas** en `middleware.ts` (`lib/auth.ts` → `areaForPath`).
4. **RLS de Supabase** (frontera de datos real).

## 🛒 COMPRADOR (maquiladora) — `/dashboard` y subrutas
Shell: `app/(dashboard)/` · Nav: `COMPRADOR_NAV`
- Dashboard · Catálogo MRO · Quick Order · Cotizar (RFQ) · Cotizaciones
- Órdenes · Crédito y facturación · Mis listas · Reorden auto
- Spend analytics · Notificaciones · Empresa y equipo
- Asistente "Hey Novak" (widget)

## 🏭 PROVEEDOR (merchant) — `/proveedor/*`
Shell: `app/(proveedor)/` · Nav: `PROVEEDOR_NAV`
- Inicio (RFQs con **comprador enmascarado**, plan, ventas)
- Mi catálogo (CRUD + carga con IA)
- Mensajes (mediados, con redacción de contactos)
- Mi cuenta (ficha, cumplimiento, cobro)
> Nunca ve: precios de otros proveedores, datos del comprador, módulos de compra ni el panel admin.

## 🛡️ ADMIN (equipo Novak) — `/admin/*`
Shell: `app/(admin)/` · Nav: `ADMIN_NAV`
- Inicio (KPIs del broker) · Mesa de operaciones (Kanban)
- Constructor de cotizaciones · Proveedores · Tesorería y crédito

## Reglas de acceso (middleware)
- Sin sesión + ruta protegida → `/login?next=…`
- Rol distinto al área → redirige a su `home` (`homeForRole`)
- `admin` puede entrar a todo; comprador y proveedor solo a su área
- **Modo demo** (sin Supabase): guardas desactivadas y aparece el
  **selector de vistas de demostración** al pie del sidebar para explorar los 3 portales.
  Con sesión real ese selector NO se muestra.

## Rutas públicas (sin rol)
`/` (home comprador), `/vender` (+`/registro`), `/catalogo`, `/login`, `/registro`, `/auth/*`.
