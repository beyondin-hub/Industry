# Deploy de Novak en Vercel

Novak está listo para desplegarse en Vercel. **Corre en modo demo sin variables de
entorno** (datos de demostración), así que puedes publicar primero y conectar
integraciones después.

## 1. Importar el proyecto

1. Entra a **https://vercel.com/new**.
2. Conecta tu cuenta de GitHub y selecciona el repositorio **`beyondin-hub/industry`**.
3. En **Branch**, elige `claude/mrolink-mvp-architecture-aCmEu`
   (o haz merge a `main` y deja `main`).
4. Vercel detecta **Next.js** automáticamente:
   - Build Command: `next build`
   - Output: `.next`
   - Install: `npm install`
   - Node: 18.18+ (definido en `package.json` → `engines`).
5. Pulsa **Deploy**. En ~2 min tendrás `https://<tu-proyecto>.vercel.app`.

## 2. Dominio personalizado (heynovak.com)

1. En el proyecto → **Settings → Domains → Add** → `heynovak.com` (y `www`).
2. Sigue las instrucciones DNS (registro A / CNAME) que te da Vercel en tu registrador.
3. Cuando el dominio quede activo, agrega la variable `NEXT_PUBLIC_APP_URL=https://heynovak.com`
   (Settings → Environment Variables) y vuelve a desplegar para que los metadatos/OG
   usen el dominio final.

## 3. Variables de entorno (opcionales — activan datos reales)

Sin estas, Novak funciona con datos demo. Para producción real, agrégalas en
**Settings → Environment Variables** (Production + Preview):

| Variable | Para qué |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Base de datos / auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Alta de empresa/usuario en el registro (solo servidor) |
| `ANTHROPIC_API_KEY` | Asistente Novak con IA real (si falta, usa respuestas locales) |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Membresías de proveedor |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM` | Notificaciones WhatsApp |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Emails (CFDI, cotizaciones) |
| `NEXT_PUBLIC_APP_URL` | URL pública (para magic link y metadatos) |

> Antes de usar Supabase aplica las migraciones de `supabase/migrations/`
> (schema, RLS y seed) en tu proyecto.

### Configuración de Auth en Supabase (para magic link / confirmación)
En el dashboard de Supabase → **Authentication → URL Configuration**:
- **Site URL**: tu URL pública (ej. `https://novak-red.vercel.app` o `https://heynovak.com`).
- **Redirect URLs**: agrega `https://<tu-url>/auth/callback` y
  `http://localhost:3000/auth/callback`.

Sin esto, el enlace mágico y la confirmación de correo no cierran la sesión. La app
ya incluye la ruta `/auth/callback` que intercambia el código por la sesión.

## 4. Verificación local del build de producción

```bash
npm install
npm run build   # debe terminar sin errores
npm run start   # http://localhost:3000
```

## 5. Checklist para operar EN VIVO (sin modo demo)

Cuando agregas las variables de Supabase, la app deja el modo demo: las guardas
por rol y las aprobaciones operan de verdad. Para que funcione completo:

1. **Aplica TODAS las migraciones** en orden (`supabase/migrations/`):
   `0001_init` → `0002_rls` → `0003_seed` → `0004_marketplace` → `0005_credito` → `0006_tesoreria`.
2. **Roles de usuario** (los lee el middleware):
   - Comprador: se asigna solo al registrarse (`user_metadata.role = comprador`).
   - Proveedor: se asigna solo en el alta (`app_metadata.role = proveedor`).
   - **Admin (equipo Novak):** créalo manualmente y ponle el rol. En Supabase →
     Authentication → Users → (tu usuario) → **App Metadata**: `{ "role": "admin" }`.
3. **Auth → URL Configuration:** Site URL + Redirect `https://<tu-url>/auth/callback`.
4. **Notificaciones al proveedor (aprobar/rechazar)** — requieren:
   - WhatsApp: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`.
   - Email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
   Sin estas, el envío degrada a un log en servidor (no falla).
5. **Asistente Novak con IA real:** `ANTHROPIC_API_KEY` (si falta, usa respuestas locales).

Con esto: registro de proveedor (estado `pendiente`) → bandeja admin aprueba
(`estado: aprobado` + WhatsApp/email al proveedor) → su portal se activa; y un
comprador no puede abrir `/admin` ni `/proveedor` aunque escriba la URL.
