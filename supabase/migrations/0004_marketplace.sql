-- ════════════════════════════════════════════════════════════════
-- Novak — Marketplace de proveedores: cuenta administradora,
-- alta self-service, publicación de productos y mensajería mediada.
-- ════════════════════════════════════════════════════════════════

-- ─── Campos de alta self-service en providers ─────────────────
alter table providers add column if not exists nombre_contacto varchar;
alter table providers add column if not exists email varchar;
alter table providers add column if not exists telefono varchar;
alter table providers add column if not exists sitio_web varchar;
alter table providers add column if not exists anios_operando integer;
alter table providers add column if not exists marcas varchar[] default '{}';
alter table providers add column if not exists clabe varchar;            -- para pagos de Novak al proveedor
alter table providers add column if not exists fulfillment varchar[] default '{}'; -- fulfillment_tj | dropshipping | entrega_directa
alter table providers add column if not exists cobertura varchar[] default '{}';
alter table providers add column if not exists acepta_financiamiento boolean default true;
alter table providers add column if not exists plazo_pago varchar default '30';
alter table providers add column if not exists estado varchar default 'pendiente'
  check (estado in ('pendiente','aprobado','suspendido'));
alter table providers add column if not exists es_fundador boolean default false;

-- ─── Usuarios del proveedor (cuenta administradora) ───────────
create table if not exists provider_users (
  id uuid primary key references auth.users(id) on delete cascade,
  provider_id uuid references providers(id) on delete cascade,
  nombre varchar not null,
  puesto varchar,
  rol varchar default 'admin_proveedor' check (rol in ('admin_proveedor','vendedor')),
  created_at timestamptz default now()
);

-- ─── Mensajería mediada por Novak (comprador ↔ Novak ↔ proveedor) ──
-- Los datos de contacto se redactan en la app antes de persistir.
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  rfq_id uuid references rfqs(id) on delete cascade,
  provider_id uuid references providers(id) on delete set null,
  remitente varchar not null check (remitente in ('comprador','proveedor','novak')),
  remitente_id uuid,
  cuerpo text not null,
  redactado boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_messages_rfq on messages(rfq_id);

-- ─── Productos: marca de publicación ──────────────────────────
alter table products add column if not exists publicado boolean default true;
alter table products add column if not exists creado_por uuid; -- provider_user que lo subió

-- ─── Helpers ──────────────────────────────────────────────────
create or replace function auth_provider_id()
returns uuid language sql stable security definer set search_path = public as $$
  select provider_id from provider_users where id = auth.uid();
$$;

-- ─── RLS ──────────────────────────────────────────────────────
alter table provider_users enable row level security;
alter table messages       enable row level security;

-- El proveedor ve/gestiona su propia ficha.
create policy "Proveedor ve su ficha"
  on providers for select
  using (activo = true or id = auth_provider_id() or is_mrolink_admin());
create policy "Proveedor actualiza su ficha"
  on providers for update
  using (id = auth_provider_id() or is_mrolink_admin());

create policy "Provider users propios"
  on provider_users for select
  using (id = auth.uid() or provider_id = auth_provider_id() or is_mrolink_admin());

-- El proveedor gestiona sus propios productos.
create policy "Proveedor inserta sus productos"
  on products for insert
  with check (provider_id = auth_provider_id() or is_mrolink_admin());
create policy "Proveedor actualiza sus productos"
  on products for update
  using (provider_id = auth_provider_id() or is_mrolink_admin());

-- Mensajería: el proveedor ve los mensajes de sus RFQ asignados; Novak ve todo.
create policy "Mensajes del proveedor"
  on messages for select
  using (provider_id = auth_provider_id() or is_mrolink_admin());
create policy "Mensajes insertar proveedor"
  on messages for insert
  with check (provider_id = auth_provider_id() or is_mrolink_admin());
