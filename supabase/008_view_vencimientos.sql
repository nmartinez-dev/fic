-- =====================================================================
-- Vencimientos + si la factura asociada ya tiene recibo generado.
-- Permite alertar "vence pronto y todavía no tiene recibo".
-- =====================================================================
create or replace view public.v_vencimientos
with (security_invoker = on) as
select
  v.id,
  v.factura_id,
  v.proveedor_id,
  v.titulo,
  v.fecha,
  v.monto,
  v.estado,
  v.created_at,
  v.updated_at,
  (r.id is not null) as tiene_recibo
from public.vencimientos v
left join public.recibos r on r.factura_id = v.factura_id;
