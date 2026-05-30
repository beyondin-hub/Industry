-- ════════════════════════════════════════════════════════════════
-- Novak — Núcleo de gobierno (P0): equipo, compradores/KYC, auditoría
-- ════════════════════════════════════════════════════════════════

-- ─── Equipo interno Novak ─────────────────────────────────────
create table if not exists team_members (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre varchar not null,
  email varchar,
  rol_admin varchar default 'ops' check (rol_admin in ('super_admin','ops','finanzas','soporte')),
  activo boolean default true,
  invitado_por uuid,
  created_at timestamptz default now()
);

-- ─── Compradores: KYC y estado de cuenta ──────────────────────
alter table companies add column if not exists kyc_estado varchar default 'pendiente'
  check (kyc_estado in ('pendiente','verificado','rechazado'));
alter table companies add column if not exists estado varchar default 'activa'
  check (estado in ('activa','suspendida'));

-- ─── Bitácora de auditoría ────────────────────────────────────
create table if not exists audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid,
  actor_nombre varchar,
  accion varchar not null,         -- ej. 'provider.approve', 'credit.set_line'
  entidad varchar,                 -- ej. 'provider', 'company'
  entidad_id varchar,
  detalle jsonb default '{}',
  created_at timestamptz default now()
);
create index if not exists idx_audit_created on audit_log(created_at desc);

-- ─── RLS ──────────────────────────────────────────────────────
alter table team_members enable row level security;
alter table audit_log    enable row level security;

-- Solo el equipo Novak (admin) ve/gestiona estas tablas.
create policy "Equipo Novak gestiona team_members"
  on team_members for all using (is_mrolink_admin()) with check (is_mrolink_admin());

create policy "Auditoría visible para admin"
  on audit_log for select using (is_mrolink_admin());
create policy "Auditoría escribe admin"
  on audit_log for insert with check (is_mrolink_admin());

-- Admin puede gestionar cualquier empresa compradora.
create policy "Admin gestiona compradores"
  on companies for update using (is_mrolink_admin());
