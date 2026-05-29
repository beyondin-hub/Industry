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

-- ─── Productos adicionales (catálogo completo: 20 SKUs) ───────
insert into products (id, provider_id, nombre, numero_parte, marca, categoria, subcategoria, descripcion, especificaciones, certificaciones, precio_base, precio_minimo, unidad, stock_actual, tiempo_entrega_horas)
values
  ('00000000-0000-0000-0000-0000000000b9', '00000000-0000-0000-0000-0000000000a1', 'Chumacera de pie UCP205-16', 'UCP205-16', 'FYH', 'rodamientos', 'Chumaceras', 'Unidad de rodamiento montado tipo pie, hierro fundido.', '{"Diámetro flecha":"1 in","Tipo":"Pie"}', '{"ISO 9001"}', 285.00, 234.00, 'pza', 120, 48),
  ('00000000-0000-0000-0000-0000000000c3', '00000000-0000-0000-0000-0000000000a2', 'Respirador N95 plegable (caja 20 pzas)', 'N95-FOLD-20', '3M', 'epp', 'Respiradores', 'Respirador desechable N95 con válvula de exhalación.', '{"Tipo":"N95 con válvula","Contenido":"20 piezas"}', '{"NOM-115"}', 420.00, 360.00, 'caja', 90, 48),
  ('00000000-0000-0000-0000-0000000000c4', '00000000-0000-0000-0000-0000000000a3', 'Aceite hidráulico ISO 46 (cubeta 19L)', 'AH-ISO46-19', 'Shell Tellus', 'lubricantes', 'Aceites hidráulicos', 'Aceite hidráulico antidesgaste ISO VG 46.', '{"Viscosidad":"ISO VG 46","Presentación":"Cubeta 19 L"}', '{"NOM-138"}', 1280.00, 1090.00, 'cubeta', 75, 48),
  ('00000000-0000-0000-0000-0000000000c5', '00000000-0000-0000-0000-0000000000a3', 'Desengrasante industrial biodegradable (galón)', 'DEG-BIO-GAL', 'Zep', 'lubricantes', 'Desengrasantes', 'Limpiador desengrasante concentrado y biodegradable.', '{"Dilución":"Hasta 1:20","Presentación":"Galón"}', '{"NOM-138"}', 320.00, 260.00, 'galón', 180, 24),
  ('00000000-0000-0000-0000-0000000000c6', '00000000-0000-0000-0000-0000000000a4', 'Taladro atornillador inalámbrico 18V (2 baterías)', 'TAL-18V-2B', 'DeWalt', 'herramientas', 'Eléctricas', 'Taladro percutor 18V brushless con 2 baterías 4Ah.', '{"Voltaje":"18 V","Torque":"65 Nm"}', '{"ISO 9001"}', 3450.00, 3050.00, 'kit', 38, 48),
  ('00000000-0000-0000-0000-0000000000c7', '00000000-0000-0000-0000-0000000000a4', 'Tornillo hexagonal M8x30 grado 8.8 (caja 100)', 'TORN-M8X30-88', 'Fastenal', 'sujetadores', 'Tornillos', 'Tornillo hexagonal métrico grado 8.8 zincado.', '{"Medida":"M8 x 30 mm","Grado":"8.8"}', '{"ISO 9001"}', 240.00, 185.00, 'caja', 220, 24),
  ('00000000-0000-0000-0000-0000000000c8', '00000000-0000-0000-0000-0000000000a5', 'Electroválvula 5/2 vías 1/4" 24VDC', 'VAL-52-14-24', 'SMC', 'neumatica', 'Válvulas', 'Válvula solenoide 5/2 vías monoestable, bobina 24VDC.', '{"Configuración":"5/2 vías","Bobina":"24 VDC"}', '{"ISO 9001","IATF 16949"}', 1240.00, 1040.00, 'pza', 68, 48),
  ('00000000-0000-0000-0000-0000000000c9', '00000000-0000-0000-0000-0000000000a6', 'Relevador de control 24VDC 8 pines + base', 'REL-24-8P', 'Schneider', 'electrico', 'Relevadores', 'Relevador electromecánico DPDT 24VDC con base DIN.', '{"Bobina":"24 VDC","Contactos":"DPDT","Corriente":"10 A"}', '{"ISO 9001"}', 210.00, 168.00, 'pza', 0, 72),
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000a2', 'Disco de corte para metal 4-1/2" x 0.045" (paq. 25)', 'DISC-45-METAL', 'Norton', 'abrasivos', 'Discos de corte', 'Disco de corte tipo 1 de óxido de aluminio.', '{"Diámetro":"4-1/2","Espesor":"0.045"}', '{"ISO 9001"}', 480.00, 390.00, 'paquete', 160, 24),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000a1', 'Kit surtido de O-rings Buna-N 419 piezas', 'ORING-KIT-419', 'Parker', 'sellos', 'O-rings', 'Surtido de 419 O-rings de nitrilo en 30 medidas métricas.', '{"Material":"Nitrilo","Dureza":"70 Shore A"}', '{"ISO 9001"}', 690.00, 560.00, 'kit', 85, 48),
  ('00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-0000000000a3', 'Filtro de aire para compresor industrial', 'FIL-AIR-COMP', 'Donaldson', 'filtros', 'Aire', 'Elemento filtrante de aire para compresores de tornillo.', '{"Eficiencia":"99.9% @ 3µm"}', '{"ISO 9001"}', 760.00, 620.00, 'pza', 48, 48),
  ('00000000-0000-0000-0000-0000000000d4', '00000000-0000-0000-0000-0000000000a1', 'Banda en V industrial A-42 (perfil clásico)', 'BANDA-A42', 'Gates', 'rodamientos', 'Bandas en V', 'Banda de transmisión en V perfil A, sección 13mm.', '{"Perfil":"A","Longitud externa":"44 in"}', '{"ISO 9001"}', 145.00, 112.00, 'pza', 290, 24)
on conflict (id) do nothing;

-- Precios escalonados de productos adicionales
insert into price_tiers (product_id, cantidad_minima, precio) values
  ('00000000-0000-0000-0000-0000000000c6', 1, 3450.00),
  ('00000000-0000-0000-0000-0000000000c6', 5, 3250.00),
  ('00000000-0000-0000-0000-0000000000c6', 10, 3050.00),
  ('00000000-0000-0000-0000-0000000000c8', 1, 1240.00),
  ('00000000-0000-0000-0000-0000000000c8', 5, 1140.00),
  ('00000000-0000-0000-0000-0000000000c8', 10, 1040.00),
  ('00000000-0000-0000-0000-0000000000d1', 1, 480.00),
  ('00000000-0000-0000-0000-0000000000d1', 5, 430.00),
  ('00000000-0000-0000-0000-0000000000d1', 20, 390.00),
  ('00000000-0000-0000-0000-0000000000d4', 1, 145.00),
  ('00000000-0000-0000-0000-0000000000d4', 10, 128.00),
  ('00000000-0000-0000-0000-0000000000d4', 50, 112.00);
