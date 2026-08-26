-- Avisos por órdenes de compra pendientes demasiado tiempo.

alter table public.avisos drop constraint if exists avisos_tipo_check;

alter table public.avisos add constraint avisos_tipo_check
  check (tipo in ('vencimiento', 'reclamo', 'sistema', 'orden'));

alter table public.avisos
  add column if not exists orden_id uuid references public.ordenes_compra (id) on delete cascade;

create unique index if not exists avisos_orden_pendiente_unico
  on public.avisos (orden_id)
  where estado = 'pendiente' and tipo = 'orden' and orden_id is not null;

alter table public.settings
  add column if not exists dias_aviso_orden_pendiente int not null default 14;
