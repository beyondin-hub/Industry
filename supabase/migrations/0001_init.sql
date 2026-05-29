-- ════════════════════════════════════════════════════════════════
-- MROLink — Esquema inicial
-- Broker digital de insumos MRO para la industria maquiladora MX.
-- ════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ─── Empresas compradoras ──────────────────────────────────────
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  nombre varchar not null,
  rfc varchar unique not null,
  industria varchar,
  ciudad varchar,
  credito_aprobado boolean default false,
  limite_credito decimal(12,2) default 0,
  dias_credito integer default 0,
  created_at timestamptz default now()
);

-- ─── Usuarios compradores (varios por empresa) ─────────────────
create table if not exists buyers (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  nombre varchar not null,
  puesto varchar,
  telefono varchar,
  rol varchar default 'comprador' check (rol in ('comprador','autorizador','admin_empresa')),
  limite_compra decimal(10,2) default 0,
  created_at timestamptz default now()
);

-- ─── Proveedores ───────────────────────────────────────────────
create table if not exists providers (
  id uuid primary key default uuid_generate_v4(),
  razon_social varchar not null,
  rfc varchar unique not null,
  nombre_comercial varchar,
  ciudad varchar,
  categorias varchar[] default '{}',
  certificaciones varchar[] default '{}',
  score decimal(3,1) default 0,
  stock_confirmado boolean default false,
  credito_disponible integer default 0,
  activo boolean default true,
  plan_membresia varchar default 'basico' check (plan_membresia in ('basico','premium','enterprise')),
  created_at timestamptz default now()
);

-- ─── Catálogo de productos MRO ─────────────────────────────────
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references providers(id) on delete cascade,
  nombre varchar not null,
  numero_parte varchar,
  marca varchar,
  categoria varchar,
  subcategoria varchar,
  descripcion text,
  especificaciones jsonb default '{}',
  certificaciones varchar[] default '{}',
  precio_base decimal(10,2),
  precio_minimo decimal(10,2),
  unidad varchar default 'pza',
  stock_actual integer default 0,
  stock_minimo integer default 10,
  tiempo_entrega_horas integer default 48,
  imagen_url varchar,
  ficha_tecnica_url varchar,
  cad_url varchar,
  activo boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_products_categoria on products(categoria);
create index if not exists idx_products_numero_parte on products(numero_parte);

-- ─── Precios escalonados por volumen ───────────────────────────
create table if not exists price_tiers (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  cantidad_minima integer not null,
  precio decimal(10,2) not null
);

-- ─── RFQ — Request for Quotation ───────────────────────────────
create table if not exists rfqs (
  id uuid primary key default uuid_generate_v4(),
  folio varchar unique,
  buyer_id uuid references buyers(id) on delete set null,
  company_id uuid references companies(id) on delete cascade,
  estado varchar default 'nuevo' check (estado in ('nuevo','en_proceso','cotizado','aprobado','cerrado')),
  urgencia varchar default 'normal' check (urgencia in ('urgente_24h','normal','programado')),
  condicion_pago varchar default 'contado' check (condicion_pago in ('contado','30','60','90')),
  requiere_cfdi boolean default true,
  notas text,
  total_estimado decimal(12,2),
  created_at timestamptz default now(),
  deadline_cotizacion timestamptz
);

create table if not exists rfq_items (
  id uuid primary key default uuid_generate_v4(),
  rfq_id uuid references rfqs(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  descripcion varchar not null,
  numero_parte varchar,
  cantidad integer not null,
  unidad varchar,
  certificacion_requerida varchar,
  imagen_url varchar
);

-- ─── Cotizaciones ──────────────────────────────────────────────
create table if not exists quotations (
  id uuid primary key default uuid_generate_v4(),
  folio varchar unique,
  rfq_id uuid references rfqs(id) on delete cascade,
  provider_id uuid references providers(id) on delete set null,
  estado varchar default 'pendiente' check (estado in ('pendiente','enviada','aceptada','rechazada')),
  subtotal decimal(12,2),
  comision_broker decimal(12,2),
  iva decimal(12,2),
  total decimal(12,2),
  tiempo_entrega_horas integer,
  condicion_pago varchar,
  valida_hasta timestamptz,
  pdf_url varchar,
  created_at timestamptz default now()
);

-- ─── Órdenes de compra ─────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  folio varchar unique,
  quotation_id uuid references quotations(id) on delete set null,
  company_id uuid references companies(id) on delete cascade,
  provider_id uuid references providers(id) on delete set null,
  categoria varchar,
  estado varchar default 'confirmada' check (estado in ('confirmada','en_preparacion','en_transito','entregada','cancelada')),
  total decimal(12,2),
  es_credito boolean default false,
  fecha_vencimiento_credito timestamptz,
  tracking_url varchar,
  cfdi_url varchar,
  cfdi_uuid varchar,
  notas_entrega text,
  created_at timestamptz default now(),
  entregada_at timestamptz
);

-- ─── Reorden automático (Subscribe & Save) ─────────────────────
create table if not exists auto_reorders (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  cantidad integer not null,
  frecuencia_dias integer,
  descuento_pct decimal(4,2) default 5.0,
  activo boolean default true,
  proxima_fecha timestamptz,
  created_at timestamptz default now()
);

-- ─── Listas de compra (Grainger Lists) ─────────────────────────
create table if not exists shopping_lists (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  nombre varchar not null,
  es_favorita boolean default false,
  created_at timestamptz default now()
);

create table if not exists shopping_list_items (
  id uuid primary key default uuid_generate_v4(),
  list_id uuid references shopping_lists(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  cantidad integer default 1
);

-- ─── Analytics de gasto ────────────────────────────────────────
create table if not exists spend_analytics (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  mes integer,
  anio integer,
  categoria varchar,
  total_gastado decimal(12,2),
  num_ordenes integer,
  proveedor_top uuid references providers(id) on delete set null
);

-- ─── Notificaciones ────────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  buyer_id uuid references buyers(id) on delete cascade,
  tipo varchar,
  titulo varchar,
  mensaje text,
  leida boolean default false,
  canal varchar default 'web' check (canal in ('web','whatsapp','email')),
  created_at timestamptz default now()
);

-- ─── Historial de precios (inteligencia de mercado) ────────────
create table if not exists price_history (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  precio decimal(10,2),
  fecha timestamptz default now()
);
