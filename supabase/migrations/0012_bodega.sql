-- ════════════════════════════════════════════════════════════════
-- Novak — Bodega / Fulfillment (Hub Tijuana).
-- Inventario consolidado de productos en el hub + bitácora de movimientos.
-- Habilita el modo fulfillment_tj: stock físico bajo control de Novak.
-- ════════════════════════════════════════════════════════════════

create table if not exists warehouse_inventory (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete set null,
  provider_id uuid references providers(id) on delete set null,
  sku varchar,
  nombre varchar,
  ubicacion varchar,                 -- bin/rack, ej. "A-12-3"
  stock integer default 0,           -- físico en bodega
  reservado integer default 0,       -- comprometido a órdenes
  stock_minimo integer default 0,
  costo_unitario numeric,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
create index if not exists idx_wh_inv_provider on warehouse_inventory(provider_id);
create index if not exists idx_wh_inv_sku on warehouse_inventory(sku);

create table if not exists warehouse_movements (
  id uuid primary key default uuid_generate_v4(),
  inventory_id uuid references warehouse_inventory(id) on delete cascade,
  tipo varchar check (tipo in ('entrada','salida','reserva','liberacion','ajuste')),
  cantidad integer not null,
  saldo integer,                     -- saldo resultante
  referencia varchar,                -- folio de orden / nota
  usuario varchar,
  created_at timestamptz default now()
);
create index if not exists idx_wh_mov_inv on warehouse_movements(inventory_id);

alter table warehouse_inventory enable row level security;
alter table warehouse_movements enable row level security;

-- Bodega es operación interna: solo el equipo Novak.
create policy "Inventario admin" on warehouse_inventory for all using (is_mrolink_admin()) with check (is_mrolink_admin());
create policy "Movimientos admin" on warehouse_movements for all using (is_mrolink_admin()) with check (is_mrolink_admin());
-- El proveedor puede consultar su propio inventario consignado en el hub.
create policy "Inventario del proveedor"
  on warehouse_inventory for select
  using (provider_id = auth_provider_id() or is_mrolink_admin());
