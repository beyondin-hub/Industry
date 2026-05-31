# Estrategia de logística y cumplimiento — Novak

> La logística ES la promesa de Novak. La garantía de 2h y la entrega 24–48h
> dependen de una red de cumplimiento confiable. Diseño orientado al dolor del
> comprador maquilador (paro de línea) y a escalar de la franja fronteriza a nivel nacional.

## 1. Principios de diseño (orientados al comprador maquila)
1. **Certeza > velocidad bruta:** "stock confirmado + ETA exacta" vence a "rápido pero incierto".
2. **Consolidación:** una sola recepción en andén, un solo CFDI con Carta Porte, aunque el pedido venga de varios proveedores. (El comprador maquila odia recibir 6 paquetes de 6 proveedores en 6 horarios.)
3. **Cita y ventana de entrega:** las maquilas tienen horarios de recepción y andenes; entregar "cuando sea" no sirve.
4. **Trazabilidad total + alertas** (WhatsApp/app) en cada hito.
5. **Cumplimiento fiscal/transporte:** CFDI de traslado + **Carta Porte** (obligatorio en MX) en cada envío.
6. **SLA del paro de línea:** para top SKUs, opción de emergencia (2–4h) en zona fronteriza.

## 2. Modelo de cumplimiento multimodal (3 modos + última milla)
Novak orquesta; el motor decide el modo por SKU, origen, destino, urgencia y stock.

- **A) Fulfillment Novak — Hub Tijuana (opt-in para proveedores).**
  Inventario consignado de top SKUs / proveedores que opten. Cubre **Tijuana + franja fronteriza**.
  Entrega 24–48h (mismo día posible). Novak controla picking/packing/última milla → máxima certeza.
- **B) Dropshipping orquestado (fuera de TJ y long-tail).**
  El proveedor surte; Novak agenda **pickup**, genera **guía + Carta Porte**, etiqueta y rastrea.
  Habilita **cobertura nacional sin capex** y catálogo largo. SLA exigido al proveedor.
- **C) Cross-dock / consolidación.**
  Recibir de varios proveedores, **consolidar** y despachar **una sola entrega** a planta.
  Es el diferenciador para la maquila. Aplica en hub TJ y en micro-hubs futuros.
- **Última milla:** flota propia/3PL en zonas densas (TJ/parques industriales) + **multi-carrier**
  nacional (Estafeta, FedEx, DHL, Paquetexpress, Tres Guerras) fuera de la frontera.

## 3. Red logística por fases (expansión nacional, asset-light)
- **Fase 0 (hoy):** Hub TJ (micro-fulfillment de top SKUs) + dropshipping nacional + carriers + Carta Porte.
- **Fase 1:** Cross-dock con 3PL en clusters maquila: **Cd. Juárez, Reynosa/Matamoros, Monterrey/Saltillo**.
- **Fase 2:** Dark stores regionales de top SKUs + rutas dedicadas a parques industriales (Bajío: Querétaro, Aguascalientes, Guanajuato).
- **Fase 3:** Integración aduanal / **IMMEX** y bonded warehouse (muchos insumos cruzan de EE.UU.); programa de importación para maquilas.

> Filosofía: **empezar ligero** (TJ + dropshipping + 3PL), comprar activos solo donde la densidad lo justifique.

## 4. Capacidades de plataforma a construir (lo que conecta con el producto Novak)
1. **Motor de ruteo de cumplimiento** — elige modo A/B/C por SKU/origen/destino/urgencia/stock.
2. **Promesa de entrega dinámica (ETA por CP/zona)** — alimenta la garantía y el checkout.
3. **WMS ligero** para el hub TJ (recepción, ubicación, picking, packing, conteo).
4. **Inventario consignado por proveedor** + reglas de reabasto/alertas.
5. **Integración multi-carrier** (cotizar tarifas, generar guías/etiquetas, tracking, webhooks).
6. **Consolidación de órdenes multi-proveedor** + cita/ventana de entrega a andén.
7. **CFDI traslado + Carta Porte** automatizado por envío.
8. **Logística inversa (RMA/devoluciones)** — atado a incidencias/soporte (ej. "faltante en orden").
9. **Torre de control logística** en el admin + visibilidad para comprador y proveedor.
10. **Costeo de envío y reglas de quién paga** (fee de entrega, incluido en comisión, surcharge por urgencia/zona/peso-volumen).

## 5. Diferenciadores de valor para el comprador maquila
- **Entrega garantizada o compensación** (SLA logístico, hermano de la garantía de 2h).
- **Consolidación + una sola factura/Carta Porte.**
- **Cita programada a andén** (respeta horarios de recepción).
- **Kit anti-paro:** stock de emergencia de top SKUs en hub fronterizo (2–4h).
- **Trazabilidad en vivo + alertas WhatsApp.**

## 6. Economía y fees (ya existen en `/admin/config`)
- `fulfillment_pct`, `entrega_por_orden`, `financiamiento_pct`.
- Añadir: **surcharge** por urgencia (same-day), zona y peso/volumen; regla de inclusión en comisión vs. cobro aparte.
- Inventario consignado: costo de oportunidad acotado a top SKUs de alta rotación.

## 7. Riesgos y mitigaciones
- **SLA de dropshipping** depende del proveedor → scorecard logístico + penalizaciones + fallback a hub.
- **Carta Porte / cumplimiento SAT** → integrar PAC con complemento Carta Porte desde el día 1.
- **Costo de inventario consignado** → solo top SKUs, con datos de demanda.
- **Cobertura nacional** → red 3PL + multi-carrier antes de comprar activos.

## 8. Métricas (north stars logísticos)
OTIF (a tiempo y completo), lead time por modo/zona, fill rate, costo de envío / GMV,
% de pedidos consolidados, daños/devoluciones, NPS de entrega.

## 9. MVP logístico recomendado (qué construir primero en Novak)
1. **Zonas y promesa de entrega** (CP/ciudad → modo + ETA) y mostrarla en catálogo/checkout.
2. **Selector de modo de cumplimiento por proveedor** (ya existe en el alta: fulfillment TJ / dropshipping / entrega gestionada) → conectarlo al ruteo.
3. **Torre de control de envíos (admin):** estados de envío, guías, tracking, incidencias/RMA.
4. **Integración multi-carrier** (empezar con 1–2: Estafeta/Skydropx-Envia.com como agregador).
5. **Carta Porte** vía PAC.
6. **Consolidación multi-proveedor** y cita de entrega.
