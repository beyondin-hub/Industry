-- ════════════════════════════════════════════════════════════════
-- MROLink — Row Level Security
-- Aísla datos por empresa (multi-tenant) usando auth.uid().
-- ════════════════════════════════════════════════════════════════

-- Helper: company_id del usuario autenticado.
create or replace function auth_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from buyers where id = auth.uid();
$$;

-- Helper: ¿el usuario es admin de MROLink? (rol custom en JWT claim)
create or replace function is_mrolink_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'app_role') = 'mrolink_admin', false);
$$;

-- ─── Activar RLS ───────────────────────────────────────────────
alter table companies            enable row level security;
alter table buyers               enable row level security;
alter table providers            enable row level security;
alter table products             enable row level security;
alter table price_tiers          enable row level security;
alter table rfqs                 enable row level security;
alter table rfq_items            enable row level security;
alter table quotations           enable row level security;
alter table orders               enable row level security;
alter table auto_reorders        enable row level security;
alter table shopping_lists       enable row level security;
alter table shopping_list_items  enable row level security;
alter table spend_analytics      enable row level security;
alter table notifications        enable row level security;
alter table price_history        enable row level security;

-- ─── Catálogo público: lectura abierta (Uline "ver precios sin login") ──
create policy "Catálogo visible para todos"
  on products for select using (activo = true or is_mrolink_admin());
create policy "Price tiers visibles"
  on price_tiers for select using (true);
create policy "Proveedores visibles"
  on providers for select using (activo = true or is_mrolink_admin());

-- ─── Empresa: el usuario solo ve/edita su propia empresa ───────
create policy "Empresa propia - select"
  on companies for select
  using (id = auth_company_id() or is_mrolink_admin());

-- ─── Buyers: visibles dentro de la misma empresa ───────────────
create policy "Buyers de mi empresa"
  on buyers for select
  using (company_id = auth_company_id() or id = auth.uid() or is_mrolink_admin());

-- ─── RFQs: aislados por empresa ────────────────────────────────
create policy "RFQ de mi empresa - select"
  on rfqs for select
  using (company_id = auth_company_id() or is_mrolink_admin());
create policy "RFQ de mi empresa - insert"
  on rfqs for insert
  with check (company_id = auth_company_id());
create policy "RFQ de mi empresa - update"
  on rfqs for update
  using (company_id = auth_company_id() or is_mrolink_admin());

create policy "RFQ items de mi empresa"
  on rfq_items for all
  using (exists (select 1 from rfqs r where r.id = rfq_items.rfq_id
                 and (r.company_id = auth_company_id() or is_mrolink_admin())))
  with check (exists (select 1 from rfqs r where r.id = rfq_items.rfq_id
                      and r.company_id = auth_company_id()));

-- ─── Cotizaciones: la empresa dueña del RFQ + admin ────────────
create policy "Cotizaciones de mis RFQ"
  on quotations for select
  using (exists (select 1 from rfqs r where r.id = quotations.rfq_id
                 and (r.company_id = auth_company_id() or is_mrolink_admin())));

-- ─── Órdenes: aisladas por empresa ─────────────────────────────
create policy "Órdenes de mi empresa - select"
  on orders for select
  using (company_id = auth_company_id() or is_mrolink_admin());
create policy "Órdenes de mi empresa - insert"
  on orders for insert
  with check (company_id = auth_company_id());

-- ─── Resto de tablas por empresa ───────────────────────────────
create policy "Auto-reorders de mi empresa"
  on auto_reorders for all
  using (company_id = auth_company_id()) with check (company_id = auth_company_id());

create policy "Listas de mi empresa"
  on shopping_lists for all
  using (company_id = auth_company_id()) with check (company_id = auth_company_id());

create policy "Items de listas de mi empresa"
  on shopping_list_items for all
  using (exists (select 1 from shopping_lists l where l.id = shopping_list_items.list_id
                 and l.company_id = auth_company_id()))
  with check (exists (select 1 from shopping_lists l where l.id = shopping_list_items.list_id
                      and l.company_id = auth_company_id()));

create policy "Analytics de mi empresa"
  on spend_analytics for select
  using (company_id = auth_company_id() or is_mrolink_admin());

create policy "Mis notificaciones"
  on notifications for all
  using (buyer_id = auth.uid()) with check (buyer_id = auth.uid());

create policy "Historial de precios - admin"
  on price_history for select using (is_mrolink_admin());
