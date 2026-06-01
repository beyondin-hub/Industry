-- ════════════════════════════════════════════════════════════════
-- Novak — Módulo Sectores (NOVAK Med + NOVAK Electronics)
-- Experiencia diferenciada por industria sobre la misma base de código.
-- ════════════════════════════════════════════════════════════════

-- ─── Sectores industriales ─────────────────────────────────────
create table if not exists industry_sectors (
  id                uuid primary key default uuid_generate_v4(),
  slug              varchar(50) unique not null,   -- 'medical' | 'electronics' | 'aerospace'
  nombre            varchar(100) not null,
  nombre_brand      varchar(100) not null,         -- 'NOVAK Med' | 'NOVAK Electronics'
  tagline           varchar(200),
  descripcion       text,
  color_primario    varchar(20),                   -- '#0E7490' médico / '#6D28D9' electrónica
  color_secundario  varchar(20),
  icono             varchar(50),                   -- emoji o nombre de ícono lucide
  activo            boolean default true,
  orden             integer default 0,
  created_at        timestamptz default now()
);

insert into industry_sectors
  (slug, nombre, nombre_brand, tagline, color_primario, color_secundario, icono, orden)
values
  ('medical', 'Manufactura de Dispositivos Médicos', 'NOVAK Med',
   'Suministros certificados para manufactura médica en Tijuana',
   '#0E7490', '#06B6D4', '🏥', 1),
  ('electronics', 'Manufactura Electrónica', 'NOVAK Electronics',
   'Todo para tu línea SMT y ensamble electrónico',
   '#6D28D9', '#8B5CF6', '💡', 2)
on conflict (slug) do nothing;

-- ─── Categorías por sector ─────────────────────────────────────
create table if not exists sector_categories (
  id           uuid primary key default uuid_generate_v4(),
  sector_id    uuid references industry_sectors(id) on delete cascade,
  slug         varchar(100) not null,
  nombre       varchar(200) not null,
  descripcion  text,
  icono        varchar(50),
  color_badge  varchar(20),
  orden        integer default 0,
  destacada    boolean default false,
  activo       boolean default true,
  unique(sector_id, slug)
);

-- Categorías NOVAK Med
with med as (select id from industry_sectors where slug = 'medical')
insert into sector_categories (sector_id, slug, nombre, descripcion, icono, color_badge, orden, destacada)
select med.id, c.slug, c.nombre, c.descripcion, c.icono, c.color, c.orden, c.destacada
from med, (values
  ('cuarto-limpio-epp',     'EPP Cuarto Limpio',        'Batas, cofias, cubrecalzado, guantes para áreas controladas',    '🥼', '#0E7490', 1, true),
  ('limpieza-desinfeccion', 'Limpieza y Desinfección',  'Wipes, IPA, solventes y químicos de proceso certificados',       '🧪', '#0E7490', 2, true),
  ('empaque-medico',        'Empaque Médico Estéril',   'Bolsas Tyvek, charolas, empaque de barrera estéril ISO 11607',   '📦', '#0E7490', 3, true),
  ('documentacion-qa',      'Documentación y QA',       'Papel cuarto limpio, etiquetas UDI, bolígrafos certificados',    '📋', '#0E7490', 4, true),
  ('lubricantes-medicos',   'Lubricantes Grado Médico', 'Aceite silicona USP, grasas FDA, lubricantes certificados',      '🔬', '#0E7490', 5, false),
  ('filtros-hepa',          'Filtros HEPA/ULPA',        'Filtros para sistemas de ventilación de sala limpia',            '💨', '#0E7490', 6, false),
  ('mro-medico',            'MRO Especializado',        'Mantenimiento certificado para equipos en plantas médicas',      '🔧', '#0E7490', 7, false)
) as c(slug, nombre, descripcion, icono, color, orden, destacada)
on conflict (sector_id, slug) do nothing;

-- Categorías NOVAK Electronics
with elec as (select id from industry_sectors where slug = 'electronics')
insert into sector_categories (sector_id, slug, nombre, descripcion, icono, color_badge, orden, destacada)
select elec.id, c.slug, c.nombre, c.descripcion, c.icono, c.color, c.orden, c.destacada
from elec, (values
  ('esd-control',         'Control ESD',            'Bolsas, tapetes, pulseras, calzado antiestático ANSI S20.20',    '⚡', '#6D28D9', 1, true),
  ('limpieza-electronica','Limpieza Electrónica',   'IPA 99%, wipes lint-free, limpiadores de flux y stencil',        '🧹', '#6D28D9', 2, true),
  ('consumibles-smt',     'Consumibles SMT',        'Squeegee blades, Kapton tape, aceite de horno, soporte PCB',     '🔩', '#6D28D9', 3, true),
  ('herramientas-rework', 'Herramientas de Rework', 'Puntas de soldadura, pinzas ESD, flux, malla desoldadora',       '🛠️', '#6D28D9', 4, true),
  ('empaque-esd',         'Empaque ESD y Producto', 'Cajas, espuma antiestática, etiquetas RoHS, stretch film ESD',   '📦', '#6D28D9', 5, false),
  ('conformal-coating',   'Conformal Coating',      'Recubrimientos protectores, solventes de remoción, aplicadores', '🎨', '#6D28D9', 6, false),
  ('epp-electronica',     'EPP Manufactura',        'Guantes nitrilo fino, respiradores, googles para solventes',     '🥽', '#6D28D9', 7, false)
) as c(slug, nombre, descripcion, icono, color, orden, destacada)
on conflict (sector_id, slug) do nothing;

-- ─── Relación productos ↔ sectores (atributos técnicos por sector) ─
create table if not exists product_sectors (
  id                  uuid primary key default uuid_generate_v4(),
  product_id          uuid references products(id) on delete cascade,
  sector_id           uuid references industry_sectors(id) on delete cascade,
  category_id         uuid references sector_categories(id) on delete set null,
  atributos_tecnicos  jsonb default '{}',
  badges              varchar(100)[] default '{}',
  uso_sector          text,
  destacado_sector    boolean default false,
  activo              boolean default true,
  unique(product_id, sector_id)
);

-- ─── Perfil de sector del comprador ────────────────────────────
alter table buyers
  add column if not exists sector_id uuid references industry_sectors(id),
  add column if not exists sector_configurado boolean default false,
  add column if not exists sector_configurado_at timestamptz;

-- ─── Guías técnicas por sector ─────────────────────────────────
create table if not exists sector_guides (
  id          uuid primary key default uuid_generate_v4(),
  sector_id   uuid references industry_sectors(id) on delete cascade,
  titulo      varchar(300) not null,
  slug        varchar(200) unique not null,
  resumen     text,
  contenido   text,                          -- Markdown
  categoria   varchar(100),                  -- 'seleccion-producto' | 'normativa' | 'proceso' | 'faq'
  tags        varchar(50)[] default '{}',
  activo      boolean default true,
  orden       integer default 0,
  created_at  timestamptz default now()
);

-- Guías iniciales NOVAK Med
insert into sector_guides (sector_id, titulo, slug, resumen, categoria, tags, orden)
select s.id, g.titulo, g.slug, g.resumen, g.categoria, g.tags, g.orden
from industry_sectors s, (values
  ('Cómo seleccionar el guante correcto para tu clase de cuarto limpio',
   'seleccion-guante-cuarto-limpio',
   'Guía práctica para elegir entre nitrilo, látex y vinilo según ISO Class 5, 7 u 8',
   'seleccion-producto', array['guantes','cuarto-limpio','ISO-13485'], 1),
  ('Normas ISO 13485 y FDA que aplican a tus insumos de manufactura',
   'normas-iso-13485-fda-insumos',
   'Qué certificaciones deben tener tus proveedores de consumibles para no fallar en auditoría',
   'normativa', array['ISO-13485','FDA','certificaciones'], 2),
  ('Checklist de insumos para preparar tu planta ante una auditoría FDA',
   'checklist-auditoria-fda',
   'Lista completa de consumibles que debes tener documentados para pasar una auditoría',
   'normativa', array['auditoria','FDA','checklist'], 3)
) as g(titulo, slug, resumen, categoria, tags, orden)
where s.slug = 'medical'
on conflict (slug) do nothing;

-- Guías iniciales NOVAK Electronics
insert into sector_guides (sector_id, titulo, slug, resumen, categoria, tags, orden)
select s.id, g.titulo, g.slug, g.resumen, g.categoria, g.tags, g.orden
from industry_sectors s, (values
  ('Guía de control ESD para tu planta de manufactura electrónica',
   'guia-control-esd-planta',
   'Todo lo que necesitas saber sobre ANSI ESD S20.20 y cómo proteger tu línea de producción',
   'proceso', array['ESD','ANSI-S20.20','manufactura-electronica'], 1),
  ('Cómo elegir el IPA correcto para limpiar tus PCBs',
   'seleccion-ipa-limpieza-pcb',
   'Diferencias entre IPA 70%, 99% y sus aplicaciones en limpieza post-soldadura',
   'seleccion-producto', array['IPA','limpieza','PCB','flux'], 2),
  ('Consumibles críticos que toda línea SMT debe tener en stock',
   'consumibles-linea-smt-stock',
   'Los 15 consumibles que si te faltan paran tu línea, y cómo asegurarte de tenerlos siempre',
   'proceso', array['SMT','squeegee','Kapton','consumibles'], 3)
) as g(titulo, slug, resumen, categoria, tags, orden)
where s.slug = 'electronics'
on conflict (slug) do nothing;

-- ─── Índices ───────────────────────────────────────────────────
create index if not exists idx_product_sectors_sector   on product_sectors(sector_id);
create index if not exists idx_product_sectors_category  on product_sectors(category_id);
create index if not exists idx_product_sectors_destacado on product_sectors(sector_id, destacado_sector) where destacado_sector = true;
create index if not exists idx_sector_categories_sector  on sector_categories(sector_id, orden);
create index if not exists idx_sector_guides_sector      on sector_guides(sector_id, orden);
create index if not exists idx_buyers_sector             on buyers(sector_id) where sector_id is not null;

-- ─── RLS — datos de referencia de catálogo (lectura pública) ────
alter table industry_sectors  enable row level security;
alter table sector_categories enable row level security;
alter table product_sectors   enable row level security;
alter table sector_guides     enable row level security;

create policy "Sectores visibles"   on industry_sectors  for select using (activo = true or is_mrolink_admin());
create policy "Categorías visibles" on sector_categories for select using (activo = true or is_mrolink_admin());
create policy "Prod-sector visible" on product_sectors    for select using (activo = true or is_mrolink_admin());
create policy "Guías visibles"      on sector_guides      for select using (activo = true or is_mrolink_admin());

-- Escritura solo para admin Novak.
create policy "Sectores admin"   on industry_sectors  for all using (is_mrolink_admin()) with check (is_mrolink_admin());
create policy "Categorías admin" on sector_categories for all using (is_mrolink_admin()) with check (is_mrolink_admin());
create policy "Prod-sector admin" on product_sectors  for all using (is_mrolink_admin()) with check (is_mrolink_admin());
create policy "Guías admin"      on sector_guides      for all using (is_mrolink_admin()) with check (is_mrolink_admin());
