# 007 — Ajustes del sistema

**Problema del PDF:** #9 — *No tener control*  
**Estado:** parcial

El cliente quiere tocar parámetros y hacer tareas operativas sin depender de
alguien externo. Priorizamos lo que **alimenta los avisos y el sync de precios**;
dejamos fuera recibos y un panel de control exhaustivo.

## Qué quedó hecho

### Pantalla Ajustes (solo admin)

Parámetros editables en una sola fila de configuración (`settings`):

| Parámetro | Para qué sirve |
| --- | --- |
| Días de aviso antes del vencimiento | Anticipación de alertas por vencimientos |
| Días para avisar orden pendiente | Cuándo avisar si un pedido sigue sin cerrarse |
| Umbral de monto para avisar | Destacar montos altos (0 = desactivado) |
| Horario de actualización de precios | Días de la semana + hora deseada (UI amigable) |

Los cambios se guardan al instante en la base; **órdenes** y **avisos** los leen
al sincronizar.

### Qué sí puede hacer el equipo sin “pedirle a nadie”

- Registrar pagos y facturas desde las pantallas entregadas.
- Ajustar umbrales y plazos de aviso.
- Disparar sync manual de precios (admin/compras).

## Qué quedó afuera (y por qué)

- **Generar recibos en PDF** — ligado al módulo de vencimientos (#12), fuera del
  cierre.
- **Cron dinámico desde Ajustes** — el cron de Vercel corre en horario fijo; la
  pantalla guarda la *intención* del admin pero no reprograma el job en esta
  entrega.
- **Edición libre de cualquier dato histórico** — se prefiere flujos guiados
  (facturas, revisión, pagos) antes que un “modo Dios” en ajustes.

## Mejoras que se podrían sumar después

- [ ] Que Vercel Cron lea la expresión guardada en Ajustes.
- [ ] Más parámetros expuestos (umbral de matching de proveedor, etc.).
- [ ] Acciones de control integradas (p. ej. regenerar avisos, forzar sync global).
