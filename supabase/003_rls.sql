-- =====================================================================
-- Row Level Security por ROL. La seguridad no vive solo en el frontend:
-- Marcela (compras) no puede tocar ventas, Julian (ventas) no puede tocar
-- proveedores/facturas, y el admin ve todo. Esto es la fuente de verdad.
-- =====================================================================

-- profiles ------------------------------------------------------------
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.auth_role() = 'admin');

create policy profiles_admin_write on public.profiles
  for all to authenticated
  using (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');

-- Tablas del area COMPRAS (admin + compras) ---------------------------
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
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      || 'using (public.auth_role() in (''admin'', ''compras'')) '
      || 'with check (public.auth_role() in (''admin'', ''compras''));',
      t || '_compras_all', t
    );
  end loop;
end $$;

-- Tabla del area VENTAS (admin + ventas) ------------------------------
alter table public.ventas enable row level security;
create policy ventas_all on public.ventas
  for all to authenticated
  using (public.auth_role() in ('admin', 'ventas'))
  with check (public.auth_role() in ('admin', 'ventas'));

-- settings: todos leen; solo el admin edita ---------------------------
alter table public.settings enable row level security;
create policy settings_select on public.settings
  for select to authenticated using (true);
create policy settings_admin_write on public.settings
  for all to authenticated
  using (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');
