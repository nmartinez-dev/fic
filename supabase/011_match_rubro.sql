-- =====================================================================
-- Matching difuso de rubros (entity resolution).
-- Mismo patrón que match_proveedor: nombre canónico + alias, pg_trgm.
-- =====================================================================
create or replace function public.match_rubro(p_nombre text)
returns table (rubro_id uuid, nombre text, score real, via text)
language sql
stable
as $$
  select rubro_id, nombre, score, via
  from (
    select distinct on (c.rubro_id)
      c.rubro_id, c.nombre, c.score, c.via
    from (
      select r.id as rubro_id, r.nombre,
             similarity(r.nombre, p_nombre) as score, 'nombre' as via
      from public.rubros r
      union all
      select a.rubro_id, r.nombre,
             similarity(a.alias, p_nombre) as score, 'alias' as via
      from public.rubro_alias a
      join public.rubros r on r.id = a.rubro_id
    ) c
    where c.score > 0.2
    order by c.rubro_id, c.score desc
  ) best
  order by score desc
  limit 5;
$$;
