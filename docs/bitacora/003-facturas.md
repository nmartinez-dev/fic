# 003 — Facturas

**Problema del PDF:** #2 — *Las facturas (multiformato, sin duplicar, que avise)*  
**Estado:** implementado

Subir facturas en PDF, Excel o escaneado y que el sistema las procese solo.
Si algo no cierra, **avisa y manda a Revisión** — no inventa datos.

## Qué quedó hecho

### Ingesta multiformato

- **PDF con texto** → lectura directa del contenido.
- **PDF escaneado o foto** → OCR con visión (si hay clave de IA configurada).
- **Excel desprolijo** → se lee tolerante a títulos corridos y filas vacías.
- El archivo original se guarda en storage cuando es posible.

### Reglas automáticas

- **Proveedor:** compara con los existentes; si no hay match claro → Revisión.
- **Duplicados:** misma factura (proveedor + número + total) → Revisión.
- **Datos faltantes** (número o total) → Revisión.
- Solo las **confirmadas** impactan en la cuenta corriente.



### Pantalla Facturas

- Tabla con número, proveedor, total, saldo, origen y estado.
- **Subir factura** (PDF, Excel o imagen).
- **Ver doc** — abre el archivo original en otra pestaña (si se guardó al subir).
- **Editar** — corregir número, fechas, total o proveedor.
- **Eliminar** — borra la factura, sus pagos, vencimientos e ítems de revisión.
- **Registrar pago** — en facturas confirmadas con saldo pendiente.
- **Banner de aviso** cuando hay facturas en revisión o ítems pendientes en la cola,
con enlace directo a **Revisión**.



### Cola de Revisión

Pantalla aparte para resolver:

- proveedor ambiguo (elegir o crear uno),
- posible duplicado (confirmar o descartar),
- datos incompletos.



### Quién lo ve

- **Admin** y **Compras** (Marcela). Ventas no.



## Mejoras que se podrían sumar después

- [ ] Guardar y mostrar **líneas de detalle** de cada factura (`factura_items`).
- [ ] Matching de **rubros** en la ingesta (hoy el tipo existe en Revisión pero no se dispara).
- [ ] Arrastrar y soltar archivos en la pantalla (hoy es selector de archivo).
- [ ] Historial de cambios / auditoría de quién editó o eliminó una factura.