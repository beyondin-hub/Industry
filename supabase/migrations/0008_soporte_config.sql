-- ════════════════════════════════════════════════════════════════
-- Novak — Soporte/mensajería y configuración de plataforma
-- ════════════════════════════════════════════════════════════════

-- ─── Tickets de soporte ───────────────────────────────────────
create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  asunto varchar not null,
  tipo varchar default 'pregunta' check (tipo in ('incidencia','pregunta','reclamo','crédito')),
  origen varchar check (origen in ('comprador','proveedor')),
  origen_nombre varchar,
  prioridad varchar default 'media' check (prioridad in ('baja','media','alta')),
  estado varchar default 'abierto' check (estado in ('abierto','en_proceso','resuelto')),
  asignado_a uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_tickets_estado on support_tickets(estado);

create table if not exists ticket_messages (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references support_tickets(id) on delete cascade,
  remitente varchar check (remitente in ('comprador','proveedor','novak')),
  cuerpo text not null,
  redactado boolean default false,
  created_at timestamptz default now()
);

-- ─── Configuración de plataforma (clave/valor) ────────────────
create table if not exists platform_config (
  clave varchar primary key,
  valor jsonb not null,
  updated_at timestamptz default now()
);

-- ─── RLS (solo equipo Novak) ──────────────────────────────────
alter table support_tickets enable row level security;
alter table ticket_messages enable row level security;
alter table platform_config enable row level security;

create policy "Tickets admin" on support_tickets for all using (is_mrolink_admin()) with check (is_mrolink_admin());
create policy "Ticket messages admin" on ticket_messages for all using (is_mrolink_admin()) with check (is_mrolink_admin());
create policy "Config lectura admin" on platform_config for select using (is_mrolink_admin());
create policy "Config escribe admin" on platform_config for all using (is_mrolink_admin()) with check (is_mrolink_admin());
