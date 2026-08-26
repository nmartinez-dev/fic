-- Avisos para ventas duplicadas o rotas + RLS por rol.

alter table public.avisos drop constraint if exists avisos_tipo_check;

alter table public.avisos add constraint avisos_tipo_check
  check (tipo in ('vencimiento', 'reclamo', 'sistema', 'orden', 'venta'));

alter table public.avisos
  add column if not exists venta_id uuid references public.ventas (id) on delete cascade;

create unique index if not exists avisos_venta_pendiente_unico
  on public.avisos (venta_id)
  where estado = 'pendiente' and tipo = 'venta' and venta_id is not null;

-- RLS: admin ve todo; compras no ve avisos de ventas; ventas solo ve avisos de ventas.
drop policy if exists avisos_compras_all on public.avisos;

create policy avisos_admin_all on public.avisos
  for all to authenticated
  using (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');

create policy avisos_compras_all on public.avisos
  for all to authenticated
  using (public.auth_role() = 'compras' and tipo <> 'venta')
  with check (public.auth_role() = 'compras' and tipo <> 'venta');

create policy avisos_ventas_select on public.avisos
  for select to authenticated
  using (public.auth_role() = 'ventas' and tipo = 'venta');

create policy avisos_ventas_insert on public.avisos
  for insert to authenticated
  with check (public.auth_role() = 'ventas' and tipo = 'venta');

create policy avisos_ventas_update on public.avisos
  for update to authenticated
  using (public.auth_role() = 'ventas' and tipo = 'venta')
  with check (public.auth_role() = 'ventas' and tipo = 'venta');
