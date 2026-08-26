# Criterios y decisiones — Cordillera

Por qué se construyó lo que se construyó, qué quedó fuera y con qué criterio.

---

## Enfoque

Cordillera nace de una ferretería que opera con **un solo usuario compartido**,
**datos inconsistentes** y **procesos manuales** (precios, facturas, seguimiento
de pedidos). El enunciado lista doce problemas; no todos tienen el mismo peso
operativo ni el mismo retorno en una prueba técnica acotada.

**Principio rector:** si el sistema no puede resolver algo con certeza, **avisa en
vez de adivinar**. Lo dudoso va a **Revisión**; lo urgente aparece en **Avisos**.
No se persigue automatizar el 100 % del negocio: se persigue **confianza en los
datos** y **visibilidad** para quien opera.

**Segundo eje:** **cada rol ve lo suyo**. Compras opera el flujo diario; ventas
consulta precios y categorías; admin configura y administra usuarios. Los permisos
viven en la base de datos, no solo en botones ocultos.

---

## Criterios para definir el scope

Al priorizar módulos se usaron estos criterios, en orden aproximado de peso:

1. **Impacto en el dolor central del cliente** — facturas multiformato, duplicados,
   pagos a medias y falta de visibilidad son el núcleo del relato; sin resolverlos
   el resto pierde sentido.

2. **Demostrabilidad en demo corta** — flujos completos de punta a punta (subir →
   revisar → pagar; orden → aviso; precios → fallo → aviso) pesan más que
   pantallas auxiliares de consulta.

3. **Dependencias técnicas** — categorías y matching de proveedor alimentan la
   ingesta; roles y RLS son prerequisito de todo lo demás; precios y órdenes son
   independientes pero encajan en el mismo modelo de avisos.

4. **Profundidad vs. extensión** — preferimos **pocos módulos bien cerrados** a
   muchas pantallas a medias. Una pantalla de proveedores sin el flujo de facturas
   resuelto no aporta; al revés sí.

5. **Tiempo de entrega realista** — el PDF pide mucho; el cierre explícito evita
   dispersión en features secundarias que compiten por el mismo tiempo de
   desarrollo y de demo.

---

## Scope establecido

### Entregado (problemas 1, 2, 5, 6, 7, 8 y 10)

| Módulo | Problema PDF | Por qué entró |
| --- | --- | --- |
| **Facturas + ingesta + Revisión** | 2 | Problema técnico central; desbloquea dedupe, proveedor y categorías |
| **Pagos parciales** | 5 | Parte natural del flujo de facturas; sin pantalla aparte |
| **Órdenes de compra** | 6 | Seguimiento operativo claro; genera avisos concretos |
| **Categorías** | 7 | Unifica gasto y mejora ingesta; ventas puede consultar |
| **Precios del portal** | 1 | Dolor diario explícito; cron + manual + aviso si falla |
| **Avisos** | 8 | Cierra el eje “avisar”; campana visible sin depender de un tab |
| **Roles y accesos** | 10 | Requisito transversal; sustituye usuario compartido |

**Parcial — Ajustes (problema 9):** umbrales, días de aviso en órdenes y
preferencia de horario para precios. Detalle en
[`bitacora/007-ajustes.md`](bitacora/007-ajustes.md).

### Fuera del scope de entrega

| Tema | Problema PDF | Por qué quedó afuera |
| --- | --- | --- |
| **Pantalla Ventas** | 3 | Dashboard de calidad de datos es valioso pero **secundario** respecto a compras e ingesta; no bloquea el flujo principal |
| **Pantalla Proveedores** | 4 | El valor de proveedores está en **matching durante la ingesta** y en Revisión, no en un ABM standalone para esta entrega |
| **Calendario / Vencimientos** | 11 | Realtime y calendario son un producto en sí; compite con cerrar facturas y órdenes con profundidad |
| **Recibos en PDF** | 12 | Depende del módulo de vencimientos; bajo retorno demo frente a ingesta y pagos |

**Importante:** fuera de scope significa **no productizado en el menú ni en el
cierre**, no “ignorado”. El matching de proveedor, aliases y cuenta corriente vía
facturas y pagos **sí están resueltos** dentro del módulo entregado.

---

## Decisiones de producto

### Revisión como inbox único

En lugar de pantallas de excepción por tipo (duplicado aquí, proveedor allá), una
**cola genérica** con tipos discriminados. Un solo lugar donde compras/admin mira
lo pendiente; extensible sin multiplicar navegación.

### Avisos sin tab en el menú

Los avisos deben **interrumpir poco y recordar mucho**. La campana en el header
cumple eso; el tab competiría con facturas y revisión. La bandeja completa sigue
accesible desde el popover.

### Ventas en lectura de precios y categorías

Ventas necesita **consultar** sin **operar**. Dar sync de precios o edición de
categorías a ventas duplicaría riesgo y no es el rol del PDF. Lectura acotada
demuestra RBAC fino sin abrir el módulo Ventas completo.

### Precios: HTTP al portal, no browser automation

El portal de la prueba expone login y JSON. Usar esa API es **más estable, rápido
y testeable** que Playwright. Si falla, el sistema avisa — coherente con el
principio rector.

### Honestidad en el cierre

Preferimos declarar **siete problemas bien cubiertos** (más ajustes parciales) a
simular doce tabs a medias.

---

## Mapa del enunciado (PDF)

Referencia rápida de los doce problemas del cliente y su estado en esta entrega.

| # | Problema | Estado |
| --- | --- | --- |
| 1 | Precios del portal | Entregado |
| 2 | Facturas multiformato | Entregado |
| 3 | Ventas / calidad de datos | Fuera de scope |
| 4 | Proveedores / cuenta corriente | Fuera de scope como pantalla; matching en ingesta |
| 5 | Pagos a medias | Entregado (dentro de Facturas) |
| 6 | Órdenes de compra | Entregado |
| 7 | Categorías | Entregado |
| 8 | Avisos | Entregado |
| 9 | Control / ajustes | Parcial — [bitácora 007](bitacora/007-ajustes.md) |
| 10 | Accesos / roles | Entregado |
| 11 | Calendario tiempo real | Fuera de scope |
| 12 | Recibos | Fuera de scope |

---

## Abordaje de problemas no entregados como módulo

El PDF pide honestidad sobre lo que quedó afuera. Estos cuatro problemas **no
tienen pantalla en el cierre**, pero sí criterio de abordaje — total o parcial.

### #3 — Ventas / calidad de datos

**Interpretación:** dashboard unificado con evolución de facturación, precios,
stock y detección de ventas duplicadas o rotas.

**Decisión:** el dolor urgente del relato es **compras e ingesta**; un dashboard
de ventas compite por tiempo y depende de datos upstream limpios. El modelo de
ventas existe en el repo, pero no se productizó en el menú. El enfoque elegido
habría sido: marcar duplicados por código de venta y excluirlos de agregados,
nunca sumarlos silenciosamente — alineado al principio “avisar en vez de adivinar”.

### #4 — Proveedores / cuenta corriente

**Interpretación:** ABM con mail y CUIT, y vista “compré / pagué / debo” por
proveedor.

**Decisión:** el valor inmediato está en **no asignar mal al cargar facturas**.
Implementamos entity resolution en ingesta (`match_proveedor`, aliases aprendidos
en Revisión) y cuenta corriente vía **facturas + pagos + saldo** en la pantalla
de Facturas. Una pantalla dedicada de proveedores sumaría poco a la demo sin
cerrar antes el pipeline de ingesta.

### #11 — Calendario de vencimientos en tiempo real

**Interpretación:** calendario visual, alta/reprogramación de vencimientos y sync
instantáneo entre usuarios.

**Decisión:** es un módulo completo (UI de calendario + Realtime + reglas de
negocio). Preferimos profundidad en facturas y órdenes. Parte de la infraestructura
(existe en base) no se expone en el menú de entrega.

### #12 — Recibos

**Interpretación:** generar comprobante de recepción antes del vencimiento y avisar
si falta.

**Decisión:** depende del calendario de vencimientos (#11). Sin ese módulo
cerrado, productizar recibos en PDF sería una pantalla huérfana. Los avisos
entregados cubren órdenes, precios y revisión — el circuito recibo–vencimiento
queda para una iteración siguiente.

**Problema #9 (parcial):** ver bitácora [007 — Ajustes](./bitacora/007-ajustes.md).

---

## Decisiones técnicas (resumen)

Estas decisiones sostienen el enfoque anterior; el detalle de implementación está
en [`arquitectura.md`](arquitectura.md).

| Decisión | Motivo |
| --- | --- |
| Supabase + RLS | Permisos reales aunque manipulen el cliente |
| Umbral de matching 0.55 | Conservador: mejor Revisión que asignación errónea |
| Estado de pago por trigger | Una sola fuente de verdad: los pagos registrados |
| Ingesta solo en servidor | Archivos, OCR y service role nunca en el browser |
| Realtime en avisos | Actualización visible sin refrescar toda la app |
| Cola `revision_queue` con payload JSON | Un esquema flexible para distintos tipos de excepción |

---

## Qué habría cambiado el scope

Si el tiempo o el objetivo fueran otros, el orden de incorporación sería:

1. **Proveedores como pantalla** — después de estabilizar ingesta y revisión (ya
   parcialmente cubierto sin UI dedicada).
2. **Vencimientos + recibos** — como bloque: calendario, Realtime y PDF van
   juntos.
3. **Dashboard Ventas** — cuando exista confianza en los datos upstream (facturas
   y categorías limpias).

Ese orden refleja dependencias de negocio, no capricho de priorización.

---

## Resumen en una frase

**Cerramos el circuito operativo de compras** — facturas, pagos, órdenes,
categorías, precios y avisos — **con roles reales y excepciones visibles**, y
dejamos fuera pantallas que no aportan a esa demo sin el tiempo para hacerlas bien.
