-- ════════════════════════════════════════════════════════════════
-- Novak — Despachos (dropshipping) + columnas de etiqueta/tracking.
-- El proveedor recibe una instrucción de despacho, imprime la etiqueta,
-- sube evidencia y confirma; medimos el SLA (creado → despachado).
-- ════════════════════════════════════════════════════════════════

-- Columnas nuevas para guías reales del agregador (EnvíaYa).
alter table shipments add column if not exists etiqueta_url varchar;
alter table shipments add column if not exists tracking_url varchar;
alter table shipment_events add column if not exists ubicacion varchar;
alter table shipment_events add column if not exists fecha timestamptz default now();

create table if not exists dispatch_instructions (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  provider_id uuid references providers(id) on delete set null,
  shipment_id uuid references shipments(id) on delete set null,
  folio varchar,
  destino varchar,
  carrier varchar,
  guia varchar,
  etiqueta_url varchar,
  estado varchar default 'pendiente' check (estado in ('pendiente','impreso','despachado','vencido')),
  deadline timestamptz,
  evidencia_url varchar,
  confirmado_at timestamptz,
  sla_horas numeric,
  nota text,
  created_at timestamptz default now()
);
create index if not exists idx_dispatch_provider on dispatch_instructions(provider_id);
create index if not exists idx_dispatch_estado on dispatch_instructions(estado);

alter table dispatch_instructions enable row level security;

-- Admin Novak gestiona todo; el proveedor ve y actualiza solo sus despachos.
create policy "Despachos admin" on dispatch_instructions for all using (is_mrolink_admin()) with check (is_mrolink_admin());
create policy "Despachos del proveedor"
  on dispatch_instructions for select
  using (provider_id = auth_provider_id() or is_mrolink_admin());
create policy "Proveedor confirma despacho"
  on dispatch_instructions for update
  using (provider_id = auth_provider_id())
  with check (provider_id = auth_provider_id());
