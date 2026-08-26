-- =====================================================================
-- Matching difuso de proveedores (entity resolution).
-- Dado un nombre tal como vino en una factura, devuelve los proveedores
-- candidatos ordenados por similitud (pg_trgm), mirando el nombre canonico
-- y todos los alias conocidos. La app decide: si el mejor score supera el
-- umbral -> match automatico; si no -> cola de revision.
-- =====================================================================
create or replace function public.match_proveedor(p_nombre text)
returns table (proveedor_id uuid, nombre text, score real, via text)
language sql
stable
as $$
  select proveedor_id, nombre, score, via
  from (
    select distinct on (c.proveedor_id)
      c.proveedor_id, c.nombre, c.score, c.via
    from (
      select p.id as proveedor_id, p.nombre,
             similarity(p.nombre, p_nombre) as score, 'nombre' as via
      from public.proveedores p
      union all
      select a.proveedor_id, p.nombre,
             similarity(a.alias, p_nombre) as score, 'alias' as via
      from public.proveedor_alias a
      join public.proveedores p on p.id = a.proveedor_id
    ) c
    where c.score > 0.2
    order by c.proveedor_id, c.score desc
  ) best
  order by score desc
  limit 5;
$$;

-- =====================================================================
-- Pagos parciales: el estado_pago de la factura se deriva de sus pagos.
-- Asi "cuales estan saldadas, cuales van por la mitad y cuales no se
-- tocaron" sale solo, sin sumar a mano.
-- =====================================================================
create or replace function public.recompute_factura_estado_pago()
returns trigger
language plpgsql
as $$
declare
  fid    uuid := coalesce(new.factura_id, old.factura_id);
  pagado numeric(14,2);
  tot    numeric(14,2);
begin
  select coalesce(sum(monto), 0) into pagado from public.pagos where factura_id = fid;
  select total into tot from public.facturas where id = fid;

  update public.facturas
  set estado_pago = case
    when tot is null or tot = 0 then 'sin_pagar'
    when pagado >= tot then 'saldada'
    when pagado > 0    then 'parcial'
    else 'sin_pagar'
  end
  where id = fid;

  return null;
end;
$$;

drop trigger if exists pagos_recompute_estado on public.pagos;
create trigger pagos_recompute_estado
  after insert or update or delete on public.pagos
  for each row execute function public.recompute_factura_estado_pago();

-- =====================================================================
-- Cuenta corriente por proveedor: "esto le compre, esto le pague, esto
-- le debo". Solo cuenta facturas confirmadas (las en_revision no impactan).
-- security_invoker => respeta las policies RLS de quien consulta.
-- =====================================================================
create or replace view public.proveedor_cuenta_corriente
with (security_invoker = on) as
select
  p.id as proveedor_id,
  p.nombre,
  p.terminos_pago_dias,
  coalesce(f.total_comprado, 0) as total_comprado,
  coalesce(pg.total_pagado, 0)  as total_pagado,
  coalesce(f.total_comprado, 0) - coalesce(pg.total_pagado, 0) as saldo
from public.proveedores p
left join (
  select proveedor_id, sum(total) as total_comprado
  from public.facturas
  where estado = 'confirmada' and proveedor_id is not null
  group by proveedor_id
) f on f.proveedor_id = p.id
left join (
  select proveedor_id, sum(monto) as total_pagado
  from public.pagos
  where proveedor_id is not null
  group by proveedor_id
) pg on pg.proveedor_id = p.id;
