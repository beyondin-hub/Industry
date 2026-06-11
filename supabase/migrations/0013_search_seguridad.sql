-- ════════════════════════════════════════════════════════════════
-- Novak — Búsqueda full-text industrial + 2FA del equipo + CFDI XML.
-- ════════════════════════════════════════════════════════════════

-- ── Full-text search sobre productos (tsvector generado + GIN) ──
alter table products add column if not exists search_vector tsvector
  generated always as (
    setweight(to_tsvector('spanish', coalesce(nombre, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(numero_parte, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(marca, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(descripcion, '')), 'C')
  ) stored;
create index if not exists idx_products_search on products using gin(search_vector);

-- ── 2FA del equipo Novak (TOTP) ──
create table if not exists admin_2fa (
  user_id uuid primary key,
  secret varchar not null,
  habilitado boolean default false,
  verificado_at timestamptz,
  created_at timestamptz default now()
);
alter table admin_2fa enable row level security;
create policy "2FA propio" on admin_2fa for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── CFDI: guardar también el XML timbrado ──
alter table orders add column if not exists cfdi_xml_url varchar;
