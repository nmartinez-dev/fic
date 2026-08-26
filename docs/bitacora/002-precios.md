# 002 — Precios del portal

**Problema del PDF:** #1 — *Los precios*  
**Estado:** implementado

Traer la lista de precios del proveedor grande al sistema **sin que alguien entre
a mano todos los días**. Marcela y el admin pueden ver la lista y forzar una
actualización cuando haga falta.

## Qué quedó hecho

### Actualización automática (cron)

- Una vez al día (02:00 hora Argentina) el sistema entra al portal, descarga la lista y la
guarda.
- Si falla el login o la descarga, **aparece un aviso en la bandeja y en la pantalla Precios** — no falla
en silencio.

### Actualización manual

- Pantalla **Precios** con tabla searchable (código, descripción, categoría).
- Botón **Actualizar ahora** para traer la lista al instante.
- Muestra la fecha de la última lista cargada.



### Cómo funciona por detrás (sin jerga)

1. El sistema entra al portal con usuario y clave (credenciales del PDF).
2. Pide la lista en formato JSON (~100 productos).
3. Guarda código, descripción, categoría, precio y stock del día.
4. Si algo sale mal, avisa en **Avisos** y también en la pantalla **Precios**.



### Quién lo ve

- **Admin** y **Compras** (Marcela). Ventas no.



## Mejoras que se podrían sumar después

- [ ] Ver **historial** de listas (comparar ayer vs. hoy).
- [ ] **Aviso automático** si un producto subió mucho de un día para otro.
- [ ] Vincular precios del portal con **facturas u órdenes de compra**.
- [ ] Subir lista manualmente (Excel) si el portal está caído.
- [ ] Que el cron respete la expresión configurable en Ajustes (hoy es fija en Vercel).