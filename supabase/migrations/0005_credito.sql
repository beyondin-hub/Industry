-- ════════════════════════════════════════════════════════════════
-- Novak — Motor de crédito y ciclo Cotización → Orden → Pago
-- ════════════════════════════════════════════════════════════════

-- ─── Pago en órdenes ──────────────────────────────────────────
alter table orders add column if not exists pagado boolean default false;
alter table orders add column if not exists fecha_pago timestamptz;
alter table orders add column if not exists metodo_pago varchar;

-- ─── Solicitudes de crédito (flujo de aprobación) ─────────────
create table if not exists credit_requests (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  limite_solicitado decimal(12,2),
  score integer,
  limite_aprobado decimal(12,2),
  dias integer,
  estado varchar default 'pendiente' check (estado in ('pendiente','aprobado','rechazado')),
  razon text,
  created_at timestamptz default now(),
  resuelto_at timestamptz
);

-- ─── Pagos / abonos ───────────────────────────────────────────
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  monto decimal(12,2) not null,
  metodo varchar default 'SPEI',
  referencia varchar,
  created_at timestamptz default now()
);
create index if not exists idx_payments_company on payments(company_id);

-- ─── RLS ──────────────────────────────────────────────────────
alter table credit_requests enable row level security;
alter table payments        enable row level security;

create policy "Solicitudes de crédito de mi empresa"
  on credit_requests for all
  using (company_id = auth_company_id() or is_mrolink_admin())
  with check (company_id = auth_company_id());

create policy "Pagos de mi empresa"
  on payments for select
  using (company_id = auth_company_id() or is_mrolink_admin());
create policy "Registrar pago de mi empresa"
  on payments for insert
  with check (company_id = auth_company_id());
