-- =====================================================================
-- Proveedores (entidad canonica) + alias.
-- El mismo proveedor aparece en las facturas escrito de varias formas;
-- lo unificamos en un unico registro y guardamos cada forma como alias.
-- =====================================================================
create table if not exists public.proveedores (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null,
  cuit                text,
  email               text,
  telefono            text,
  terminos_pago_dias  int  not null default 30
                      check (terminos_pago_dias >= 0),
  notas               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists proveedores_nombre_trgm
  on public.proveedores using gin (nombre gin_trgm_ops);

create trigger proveedores_updated_at
  before update on public.proveedores
  for each row execute function public.set_updated_at();

create table if not exists public.proveedor_alias (
  id           uuid primary key default gen_random_uuid(),
  proveedor_id uuid not null references public.proveedores (id) on delete cascade,
  alias        text not null,
  created_at   timestamptz not null default now()
);

-- Un mismo texto no puede mapear a dos proveedores distintos.
create unique index if not exists proveedor_alias_unico
  on public.proveedor_alias (lower(alias));
create index if not exists proveedor_alias_trgm
  on public.proveedor_alias using gin (alias gin_trgm_ops);

-- =====================================================================
-- Rubros (categorias) canonicos + alias. Mismo problema que proveedores:
-- "el mismo rubro escrito de cinco maneras y productos sin nada cargado".
-- =====================================================================
create table if not exists public.rubros (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.rubro_alias (
  id         uuid primary key default gen_random_uuid(),
  rubro_id   uuid not null references public.rubros (id) on delete cascade,
  alias      text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists rubro_alias_unico
  on public.rubro_alias (lower(alias));

-- =====================================================================
-- Facturas + items. Una factura puede quedar 'en_revision' cuando no se
-- pudo resolver el proveedor o hay sospecha de duplicado: en ese estado
-- NO impacta en la cuenta corriente.
-- =====================================================================
create table if not exists public.facturas (
  id                   uuid primary key default gen_random_uuid(),
  proveedor_id         uuid references public.proveedores (id) on delete set null,
  raw_proveedor_nombre text,                       -- nombre tal como vino
  numero               text,
  fecha                date,
  fecha_vencimiento    date,
  total                numeric(14,2) not null default 0,
  moneda               text not null default 'ARS',
  rubro_id             uuid references public.rubros (id) on delete set null,
  estado_pago          text not null default 'sin_pagar'
                       check (estado_pago in ('sin_pagar', 'parcial', 'saldada')),
  estado               text not null default 'confirmada'
                       check (estado in ('confirmada', 'en_revision')),
  origen               text not null default 'manual'
                       check (origen in ('pdf', 'pdf_escaneado', 'excel', 'manual')),
  archivo_path         text,
  hash_dedup           text,                        -- numero+proveedor+total normalizado
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists facturas_proveedor on public.facturas (proveedor_id);
create index if not exists facturas_vencimiento on public.facturas (fecha_vencimiento);
create index if not exists facturas_estado on public.facturas (estado);
create index if not exists facturas_hash_dedup on public.facturas (hash_dedup);

create trigger facturas_updated_at
  before update on public.facturas
  for each row execute function public.set_updated_at();

create table if not exists public.factura_items (
  id              uuid primary key default gen_random_uuid(),
  factura_id      uuid not null references public.facturas (id) on delete cascade,
  descripcion     text,
  cantidad        numeric(14,3) not null default 1,
  precio_unitario numeric(14,2) not null default 0,
  subtotal        numeric(14,2) not null default 0,
  rubro_id        uuid references public.rubros (id) on delete set null
);
create index if not exists factura_items_factura on public.factura_items (factura_id);

-- =====================================================================
-- Pagos (parciales) a facturas. "Le damos algo a cuenta y el resto
-- mas adelante": el estado_pago de la factura se deriva de estos pagos.
-- =====================================================================
create table if not exists public.pagos (
  id           uuid primary key default gen_random_uuid(),
  factura_id   uuid not null references public.facturas (id) on delete cascade,
  proveedor_id uuid references public.proveedores (id) on delete set null,
  fecha        date not null default current_date,
  monto        numeric(14,2) not null check (monto > 0),
  medio        text,
  notas        text,
  created_by   uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now()
);
create index if not exists pagos_factura on public.pagos (factura_id);
create index if not exists pagos_proveedor on public.pagos (proveedor_id);

-- =====================================================================
-- Recibos. NO es un pago: es el comprobante de que la factura se recibio
-- y va a ser pagada. Se genera hasta la fecha de vencimiento.
-- =====================================================================
create table if not exists public.recibos (
  id            uuid primary key default gen_random_uuid(),
  factura_id    uuid not null unique references public.facturas (id) on delete cascade,
  numero        text,
  fecha_emision date not null default current_date,
  generado_por  uuid references auth.users (id) on delete set null,
  archivo_path  text,
  created_at    timestamptz not null default now()
);

-- =====================================================================
-- Ordenes de compra. "Pido mercaderia, queda registrado, pero nadie lo
-- sigue": estado explicito para no pedir dos veces lo mismo.
-- =====================================================================
create table if not exists public.ordenes_compra (
  id           uuid primary key default gen_random_uuid(),
  proveedor_id uuid references public.proveedores (id) on delete set null,
  numero       text,
  fecha        date not null default current_date,
  total        numeric(14,2) not null default 0,
  estado       text not null default 'pendiente'
               check (estado in ('pendiente', 'parcial', 'recibida', 'cancelada')),
  descripcion  text,
  notas        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists ordenes_estado on public.ordenes_compra (estado);
create trigger ordenes_updated_at
  before update on public.ordenes_compra
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Ventas 2023+. Trae basura a proposito: codigos duplicados y filas rotas.
-- estado_dato marca la calidad; solo 'valida' suma en los reportes.
-- =====================================================================
create table if not exists public.ventas (
  id              uuid primary key default gen_random_uuid(),
  codigo          text,
  fecha           date,
  producto        text,
  rubro_id        uuid references public.rubros (id) on delete set null,
  cantidad        numeric(14,3),
  precio_unitario numeric(14,2),
  total           numeric(14,2),
  estado_dato     text not null default 'valida'
                  check (estado_dato in ('valida', 'duplicada', 'rota')),
  motivo_flag     text,
  created_at      timestamptz not null default now()
);
create index if not exists ventas_codigo on public.ventas (codigo);
create index if not exists ventas_fecha on public.ventas (fecha);
create index if not exists ventas_estado_dato on public.ventas (estado_dato);

-- =====================================================================
-- Precios: lista del proveedor grande, actualizada por el scraper (Fase 6).
-- =====================================================================
create table if not exists public.precios (
  id              uuid primary key default gen_random_uuid(),
  proveedor_id    uuid references public.proveedores (id) on delete set null,
  codigo_producto text not null,
  descripcion     text,
  precio          numeric(14,2) not null default 0,
  fecha_lista     date not null default current_date,
  created_at      timestamptz not null default now()
);
create unique index if not exists precios_codigo_fecha
  on public.precios (codigo_producto, fecha_lista);

-- =====================================================================
-- Vencimientos: entidad del calendario. Puede o no colgar de una factura.
-- Permite agregar/mover vencimientos sueltos.
-- =====================================================================
create table if not exists public.vencimientos (
  id           uuid primary key default gen_random_uuid(),
  factura_id   uuid references public.facturas (id) on delete cascade,
  proveedor_id uuid references public.proveedores (id) on delete set null,
  titulo       text not null,
  fecha        date not null,
  monto        numeric(14,2),
  estado       text not null default 'pendiente'
               check (estado in ('pendiente', 'pagado')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists vencimientos_fecha on public.vencimientos (fecha);
create trigger vencimientos_updated_at
  before update on public.vencimientos
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Avisos: la bandeja del sistema viejo (vencimientos por vencer, reclamos
-- de proveedores). Con estado para saber cuales quedaron sin resolver.
-- =====================================================================
create table if not exists public.avisos (
  id           uuid primary key default gen_random_uuid(),
  tipo         text not null default 'sistema'
               check (tipo in ('vencimiento', 'reclamo', 'sistema')),
  titulo       text not null,
  cuerpo       text,
  proveedor_id uuid references public.proveedores (id) on delete set null,
  fecha        date not null default current_date,
  estado       text not null default 'pendiente'
               check (estado in ('pendiente', 'resuelto')),
  resuelto_por uuid references auth.users (id) on delete set null,
  resuelto_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists avisos_estado on public.avisos (estado);

-- =====================================================================
-- Cola de revision (human-in-the-loop). El eje del sistema:
-- lo que no se puede resolver con certeza NO se adivina, se deja aca.
-- =====================================================================
create table if not exists public.revision_queue (
  id           uuid primary key default gen_random_uuid(),
  tipo         text not null
               check (tipo in ('proveedor_ambiguo', 'posible_duplicado',
                               'dato_incompleto', 'rubro_ambiguo')),
  entidad      text not null default 'factura',
  entidad_id   uuid,
  titulo       text not null,
  payload      jsonb not null default '{}'::jsonb,
  estado       text not null default 'pendiente'
               check (estado in ('pendiente', 'resuelto', 'descartado')),
  resuelto_por uuid references auth.users (id) on delete set null,
  resuelto_at  timestamptz,
  resolucion   jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists revision_estado on public.revision_queue (estado);

-- =====================================================================
-- Settings: parametros que el owner ajusta sin depender de nadie.
-- Fila unica (id = 1).
-- =====================================================================
create table if not exists public.settings (
  id                        int primary key default 1 check (id = 1),
  actualizacion_precios_cron text not null default '0 6 * * *',
  umbral_aviso_monto        numeric(14,2) not null default 0,
  dias_aviso_vencimiento    int not null default 3,
  updated_by                uuid references auth.users (id) on delete set null,
  updated_at                timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;
