-- Avisos por vencimientos próximos, vencidos o sin recibo.

alter table public.avisos
  add column if not exists vencimiento_id uuid references public.vencimientos (id) on delete cascade;

create unique index if not exists avisos_vencimiento_pendiente_unico
  on public.avisos (vencimiento_id)
  where estado = 'pendiente' and tipo = 'vencimiento' and vencimiento_id is not null;
