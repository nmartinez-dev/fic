-- Renombra el rol owner -> admin (concepto de administrador del sistema).

-- 1. Quitar constraint viejo, migrar datos, aplicar constraint nuevo
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'admin' where role = 'owner';
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'compras', 'ventas'));

-- 3. Policies de profiles
drop policy if exists profiles_owner_write on public.profiles;
drop policy if exists profiles_select on public.profiles;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.auth_role() = 'admin');

create policy profiles_admin_write on public.profiles
  for all to authenticated
  using (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');

-- 4. Policies de settings
drop policy if exists settings_owner_write on public.settings;

create policy settings_admin_write on public.settings
  for all to authenticated
  using (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');

-- 5. Policies de ventas
drop policy if exists ventas_all on public.ventas;

create policy ventas_all on public.ventas
  for all to authenticated
  using (public.auth_role() in ('admin', 'ventas'))
  with check (public.auth_role() in ('admin', 'ventas'));

-- 6. Policies del area compras (owner -> admin en la expresion)
do $$
declare
  t text;
  compras_tables text[] := array[
    'proveedores', 'proveedor_alias', 'rubros', 'rubro_alias',
    'facturas', 'factura_items', 'pagos', 'recibos', 'ordenes_compra',
    'precios', 'vencimientos', 'avisos', 'revision_queue'
  ];
begin
  foreach t in array compras_tables loop
    execute format('drop policy if exists %I on public.%I;', t || '_compras_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      || 'using (public.auth_role() in (''admin'', ''compras'')) '
      || 'with check (public.auth_role() in (''admin'', ''compras''));',
      t || '_compras_all', t
    );
  end loop;
end $$;

-- 7. Funcion merge_rubros
create or replace function public.merge_rubros(p_origen uuid, p_destino uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  origen_nombre text;
begin
  if public.auth_role() not in ('admin', 'compras') then
    raise exception 'no autorizado';
  end if;
  if p_origen = p_destino then
    raise exception 'origen y destino no pueden ser el mismo rubro';
  end if;

  select nombre into origen_nombre from public.rubros where id = p_origen;
  if origen_nombre is null then
    raise exception 'rubro origen inexistente';
  end if;

  update public.facturas       set rubro_id = p_destino where rubro_id = p_origen;
  update public.factura_items  set rubro_id = p_destino where rubro_id = p_origen;
  update public.ventas         set rubro_id = p_destino where rubro_id = p_origen;
  update public.rubro_alias    set rubro_id = p_destino where rubro_id = p_origen;

  insert into public.rubro_alias (rubro_id, alias)
  values (p_destino, origen_nombre)
  on conflict (lower(alias)) do nothing;

  delete from public.rubros where id = p_origen;
end;
$$;
