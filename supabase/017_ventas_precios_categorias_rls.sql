-- Lectura de precios y categorías para el rol ventas (consulta, sin escritura).

create policy rubros_ventas_select on public.rubros
  for select to authenticated
  using (public.auth_role() = 'ventas');

create policy rubro_alias_ventas_select on public.rubro_alias
  for select to authenticated
  using (public.auth_role() = 'ventas');

create policy precios_ventas_select on public.precios
  for select to authenticated
  using (public.auth_role() = 'ventas');
