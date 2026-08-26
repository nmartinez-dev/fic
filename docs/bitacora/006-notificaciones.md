# 006 — Notificaciones in-app

**Problema del PDF:** los avisos existían pero nadie los miraba porque estaban escondidos en el menú.

## Qué hicimos

- **Campana en el header**: muestra cuántas cosas pendientes hay sin tener que buscar la pantalla de Avisos.
- Al hacer clic se abre un **resumen** con los avisos más recientes, un acceso rápido a Revisión si hay items pendientes, y un enlace al historial completo.
- Ya **no hay pestaña Avisos** en el menú: todo entra por la campana; la bandeja completa queda en "Ver todos los avisos".
- Los avisos se **actualizan solos** mientras usás el sistema (no hace falta recargar la página).
- Al entrar al dashboard el sistema **genera avisos** por órdenes demoradas y vencimientos (compras), según ajustes.
- **Marcela y el admin** ven avisos de compras; el rol ventas no usa la campana en esta entrega.



## Cómo se usa

1. Mirá la campana arriba a la derecha: el numerito rojo indica pendientes.
2. Abrí el menú para ver el detalle o ir directo a la pantalla correspondiente.
3. Podés marcar un aviso como resuelto desde ahí, o ir a **Avisos** para ver todo el historial.



## Mejoras futuras

- [ ] Avisos por email o cron nocturno (hoy se generan al usar la app).
- [ ] Marcar avisos como “vistos” sin resolverlos (hoy el badge refleja pendientes reales del negocio).
- [ ] Alta manual de reclamos de proveedor en la bandeja.