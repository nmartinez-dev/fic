-- =====================================================================
-- Normalización de rubros: fusiona un rubro "origen" dentro de uno
-- "destino". Reasigna facturas, items y ventas, mueve los alias y guarda
-- el nombre del origen como alias del destino (para reconocerlo la próxima).
--
-- security definer: necesita tocar `ventas` (área ventas) aunque la ejecute
-- alguien de compras. Por eso adentro validamos el rol explícitamente.
-- =====================================================================
create or replace function public.merge_rubros(p_origen uuid, p_destino uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  origen_nombre text;
begin
  if public.auth_role() not in ('owner', 'compras') then
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

  -- El nombre del origen pasa a ser un alias del destino.
  insert into public.rubro_alias (rubro_id, alias)
  values (p_destino, origen_nombre)
  on conflict (lower(alias)) do nothing;

  delete from public.rubros where id = p_origen;
end;
$$;

revoke all on function public.merge_rubros(uuid, uuid) from public;
grant execute on function public.merge_rubros(uuid, uuid) to authenticated;
