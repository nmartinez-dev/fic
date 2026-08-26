# 005 — Órdenes de compra

**Problema del PDF:** #6 — *Las compras que se pierden*  
**Estado:** implementado

Pedís mercadería, queda anotado en algún lado, y nadie sigue si llegó, si falta
algo o si ya se pidió dos veces. Acá cada pedido tiene **estado** y un lugar
donde verlo.

## Qué quedó hecho

### Pantalla Órdenes

- Tabla con número, proveedor, fecha, total, descripción y **estado**.
- **Nueva orden** — registrar un pedido con proveedor, número, fecha, total y qué se pidió. Opcionalmente **adjuntar un documento** (PDF, Excel o imagen).
- **Ver documento** — abre el archivo adjunto en otra pestaña.
- **Editar** — corregir datos del pedido, notas internas o reemplazar el documento adjunto.
- **Eliminar** — borrar un pedido que se cargó mal (incluye el documento adjunto).
- **Cambiar estado** — pendiente, recibida parcial, recibida o cancelada.
- **Filtros** — ver todas, solo pendientes, parciales, recibidas o canceladas.
- **Banner** cuando hay pedidos sin cerrar, con acceso rápido al filtro de pendientes.

### Avisos automáticos

- Si un pedido sigue **pendiente o parcial** muchos días (configurable en
  **Ajustes**), aparece un aviso en la bandeja.
- Al marcar el pedido como **recibido** o **cancelado**, el aviso se cierra solo.

### Quién lo ve

- **Admin** y **Compras** (Marcela). Ventas no.

## Mejoras que se podrían sumar después

- [ ] Vincular una orden con la **factura** cuando llega la mercadería.
- [ ] **Líneas de detalle** por pedido (ítems), no solo descripción libre.
