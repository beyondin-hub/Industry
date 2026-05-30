-- ════════════════════════════════════════════════════════════════
-- Novak — CMS de contenido y automatizaciones de notificaciones
-- (El contenido del sitio se guarda en platform_config, clave 'site_content')
-- ════════════════════════════════════════════════════════════════

create table if not exists notification_rules (
  id varchar primary key,
  evento varchar not null,
  descripcion varchar,
  canales varchar[] default '{}',     -- whatsapp | email | web
  plantilla text,
  activo boolean default true,
  updated_at timestamptz default now()
);

alter table notification_rules enable row level security;
create policy "Reglas notif admin" on notification_rules for all using (is_mrolink_admin()) with check (is_mrolink_admin());
