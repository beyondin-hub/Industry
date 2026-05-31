-- ════════════════════════════════════════════════════════════════
-- Novak — Logística: envíos (shipments) y eventos de rastreo
-- ════════════════════════════════════════════════════════════════

create table if not exists shipments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  folio varchar,
  modo varchar check (modo in ('fulfillment_tj','dropshipping','entrega_directa')),
  carrier varchar,
  guia varchar,
  zona varchar,
  eta_horas integer,
  estado varchar default 'creado' check (estado in ('creado','recolectado','en_transito','entregado','incidencia')),
  cita_entrega timestamptz,
  carta_porte_uuid varchar,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_shipments_order on shipments(order_id);
create index if not exists idx_shipments_estado on shipments(estado);

create table if not exists shipment_events (
  id uuid primary key default uuid_generate_v4(),
  shipment_id uuid references shipments(id) on delete cascade,
  estado varchar,
  nota text,
  created_at timestamptz default now()
);

alter table shipments enable row level security;
alter table shipment_events enable row level security;

-- Admin Novak gestiona todo; el comprador ve los envíos de sus órdenes.
create policy "Envíos admin" on shipments for all using (is_mrolink_admin()) with check (is_mrolink_admin());
create policy "Envíos del comprador"
  on shipments for select
  using (exists (select 1 from orders o where o.id = shipments.order_id and (o.company_id = auth_company_id() or is_mrolink_admin())));
create policy "Eventos de envío admin" on shipment_events for all using (is_mrolink_admin()) with check (is_mrolink_admin());
