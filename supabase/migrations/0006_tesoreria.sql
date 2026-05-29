-- ════════════════════════════════════════════════════════════════
-- Novak — Tesorería: dispersión de pagos a proveedores y conciliación
-- ════════════════════════════════════════════════════════════════

create table if not exists provider_payouts (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  provider_id uuid references providers(id) on delete set null,
  monto decimal(12,2) not null,
  estado varchar default 'pendiente' check (estado in ('pendiente','dispersado')),
  referencia varchar,
  created_at timestamptz default now(),
  dispersado_at timestamptz
);
create index if not exists idx_payouts_provider on provider_payouts(provider_id);
create index if not exists idx_payouts_order on provider_payouts(order_id);

alter table provider_payouts enable row level security;

-- Solo Novak (admin) gestiona la tesorería; el proveedor ve sus propios payouts.
create policy "Payouts admin"
  on provider_payouts for all
  using (is_mrolink_admin())
  with check (is_mrolink_admin());
create policy "Proveedor ve sus payouts"
  on provider_payouts for select
  using (provider_id = auth_provider_id());
