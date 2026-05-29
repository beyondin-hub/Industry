-- ════════════════════════════════════════════════════════════════
-- MROLink — Datos semilla (catálogo público de demostración)
-- Proveedores y productos representativos del norte de México.
-- ════════════════════════════════════════════════════════════════

-- ─── Proveedores ───────────────────────────────────────────────
insert into providers (id, razon_social, rfc, nombre_comercial, ciudad, categorias, certificaciones, score, stock_confirmado, credito_disponible, plan_membresia)
values
  ('00000000-0000-0000-0000-0000000000a1', 'Rodamientos Industriales del Norte SA de CV', 'RIN180423AB1', 'RodaNorte', 'Tijuana', '{rodamientos,sellos}', '{"ISO 9001","IATF 16949"}', 4.8, true, 45, 'enterprise'),
  ('00000000-0000-0000-0000-0000000000a2', 'Seguridad y Protección Baja SA de CV', 'SPB200115C92', 'SeguriBaja', 'Tijuana', '{epp,abrasivos}', '{"ISO 9001","NOM-115","ANSI Z87.1"}', 4.6, true, 30, 'premium'),
  ('00000000-0000-0000-0000-0000000000a3', 'Lubricantes Técnicos de Mexicali SA de CV', 'LTM190822DE3', 'LubriTec', 'Mexicali', '{lubricantes,filtros}', '{"ISO 9001","NOM-138"}', 4.4, true, 60, 'premium'),
  ('00000000-0000-0000-0000-0000000000a4', 'Herramientas y Sistemas Juárez SA de CV', 'HSJ170310FG4', 'HerraSys', 'Ciudad Juárez', '{herramientas,sujetadores}', '{"ISO 9001"}', 4.5, true, 30, 'basico'),
  ('00000000-0000-0000-0000-0000000000a5', 'Automatización Neumática Monterrey SA de CV', 'ANM210501HI5', 'NeumaMty', 'Monterrey', '{neumatica,electrico}', '{"ISO 9001","IATF 16949"}', 4.9, true, 45, 'enterprise'),
  ('00000000-0000-0000-0000-0000000000a6', 'Controles Eléctricos del Bravo SA de CV', 'CEB220908JK6', 'ElectroBravo', 'Reynosa', '{electrico,herramientas}', '{"ISO 9001","ISO 13485"}', 4.3, false, 30, 'basico')
on conflict (rfc) do nothing;

-- ─── Productos ─────────────────────────────────────────────────
insert into products (id, provider_id, nombre, numero_parte, marca, categoria, subcategoria, descripcion, especificaciones, certificaciones, precio_base, precio_minimo, unidad, stock_actual, tiempo_entrega_horas)
values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1', 'Balero de bolas 6205-2RS sellado', '6205-2RS', 'SKF', 'rodamientos', 'Baleros de bolas', 'Rodamiento rígido de bolas con doble sello de hule.', '{"Diámetro interior":"25 mm","Diámetro exterior":"52 mm","Ancho":"15 mm"}', '{"ISO 9001","IATF 16949"}', 189.00, 142.00, 'pza', 340, 24),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a1', 'Balero de bolas 6203-ZZ blindado', '6203-ZZ', 'NSK', 'rodamientos', 'Baleros de bolas', 'Rodamiento rígido de bolas con doble blindaje metálico.', '{"Diámetro interior":"17 mm","Diámetro exterior":"40 mm","Ancho":"12 mm"}', '{"ISO 9001","IATF 16949"}', 132.00, 98.00, 'pza', 510, 24),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000a2', 'Guante de nitrilo recubierto talla 9', 'NIT-9-GR', 'Ansell', 'epp', 'Guantes', 'Guante de nylon con recubrimiento de nitrilo en palma.', '{"Talla":"9 (L)","Norma":"EN 388: 4131"}', '{"EN 388","ANSI Z87.1"}', 38.00, 24.00, 'par', 2400, 24),
  ('00000000-0000-0000-0000-0000000000b4', '00000000-0000-0000-0000-0000000000a2', 'Lentes de seguridad antiempañante claros', 'SEC-Z87-CL', '3M', 'epp', 'Protección ocular', 'Lentes de policarbonato con recubrimiento antiempañante.', '{"Norma":"ANSI Z87.1+","Protección UV":"99.9%"}', '{"ANSI Z87.1"}', 54.00, 39.00, 'pza', 1800, 24),
  ('00000000-0000-0000-0000-0000000000b5', '00000000-0000-0000-0000-0000000000a3', 'Grasa multipropósito EP2 a base de litio 400g', 'GR-EP2-400', 'Mobil', 'lubricantes', 'Grasas', 'Grasa de litio extrema presión NLGI 2 para rodamientos.', '{"Grado":"NLGI 2 / EP","Temperatura":"-20°C a 130°C"}', '{"NOM-138"}', 96.00, 74.00, 'pza', 640, 24),
  ('00000000-0000-0000-0000-0000000000b6', '00000000-0000-0000-0000-0000000000a4', 'Calibrador digital 150mm acero inoxidable', 'CAL-DIG-150', 'Mitutoyo', 'herramientas', 'Medición', 'Vernier digital con resolución 0.01mm y salida de datos.', '{"Rango":"0-150 mm","Resolución":"0.01 mm"}', '{"ISO 9001"}', 1850.00, 1620.00, 'pza', 52, 48),
  ('00000000-0000-0000-0000-0000000000b7', '00000000-0000-0000-0000-0000000000a5', 'Cilindro neumático ISO 15552 Ø32 x 100mm', 'CIL-32-100', 'Festo', 'neumatica', 'Cilindros', 'Cilindro neumático de doble efecto con amortiguación.', '{"Diámetro":"32 mm","Carrera":"100 mm","Norma":"ISO 15552"}', '{"ISO 9001","IATF 16949"}', 1980.00, 1690.00, 'pza', 44, 48),
  ('00000000-0000-0000-0000-0000000000b8', '00000000-0000-0000-0000-0000000000a5', 'Sensor inductivo M18 PNP NA 8mm', 'SEN-IND-M18', 'Omron', 'electrico', 'Sensores', 'Sensor de proximidad inductivo M18 blindado IP67.', '{"Tamaño":"M18","Detección":"8 mm","Protección":"IP67"}', '{"ISO 9001","IATF 16949"}', 540.00, 440.00, 'pza', 130, 48)
on conflict (id) do nothing;

-- ─── Precios escalonados ───────────────────────────────────────
insert into price_tiers (product_id, cantidad_minima, precio) values
  ('00000000-0000-0000-0000-0000000000b1', 1, 189.00),
  ('00000000-0000-0000-0000-0000000000b1', 10, 172.00),
  ('00000000-0000-0000-0000-0000000000b1', 50, 158.00),
  ('00000000-0000-0000-0000-0000000000b1', 100, 142.00),
  ('00000000-0000-0000-0000-0000000000b3', 1, 38.00),
  ('00000000-0000-0000-0000-0000000000b3', 12, 32.00),
  ('00000000-0000-0000-0000-0000000000b3', 144, 28.00),
  ('00000000-0000-0000-0000-0000000000b3', 500, 24.00),
  ('00000000-0000-0000-0000-0000000000b5', 1, 96.00),
  ('00000000-0000-0000-0000-0000000000b5', 12, 86.00),
  ('00000000-0000-0000-0000-0000000000b5', 48, 74.00);

-- ─── Empresas compradoras demo (maquiladoras) ─────────────────
insert into companies (id, nombre, rfc, industria, ciudad, credito_aprobado, limite_credito, dias_credito)
values
  ('00000000-0000-0000-0000-0000000000c1', 'Maquiladora Componentes del Pacífico SA de CV', 'MCP190501XY2', 'automotriz', 'Tijuana', true, 850000, 60),
  ('00000000-0000-0000-0000-0000000000c2', 'Electro Ensambles Fronterizos SA de CV', 'EEF200815AB3', 'electronica', 'Ciudad Juárez', true, 500000, 30)
on conflict (rfc) do nothing;
