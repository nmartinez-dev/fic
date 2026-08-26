-- =====================================================================
-- Vistas de apoyo para la Fase 3.
-- security_invoker => respetan las policies RLS de quien consulta.
-- =====================================================================

-- Facturas con proveedor, pagado y saldo (para la UI y el flujo de pagos).
create or replace view public.v_facturas
with (security_invoker = on) as
select
  f.id,
  f.proveedor_id,
  f.raw_proveedor_nombre,
  f.numero,
  f.fecha,
  f.fecha_vencimiento,
  f.total,
  f.moneda,
  f.rubro_id,
  f.estado_pago,
  f.estado,
  f.origen,
  f.archivo_path,
  f.hash_dedup,
  f.created_at,
  f.updated_at,
  p.nombre as proveedor_nombre,
  coalesce(pg.pagado, 0) as pagado,
  f.total - coalesce(pg.pagado, 0) as saldo
from public.facturas f
left join public.proveedores p on p.id = f.proveedor_id
left join (
  select factura_id, sum(monto) as pagado
  from public.pagos
  group by factura_id
) pg on pg.factura_id = f.id;

-- Gasto por rubro (canónico), solo facturas confirmadas. Resuelve
-- "cuánto gasto en cada tipo de producto" con los rubros ya unificados.
create or replace view public.v_gasto_por_rubro
with (security_invoker = on) as
select
  r.id as rubro_id,
  coalesce(r.nombre, 'Sin rubro') as rubro,
  count(f.id) as facturas,
  coalesce(sum(f.total), 0) as total
from public.facturas f
left join public.rubros r on r.id = f.rubro_id
where f.estado = 'confirmada'
group by r.id, r.nombre;
