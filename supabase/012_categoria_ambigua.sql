-- Renombra el tipo de revision rubro_ambiguo -> categoria_ambigua (terminologia de producto).

alter table public.revision_queue drop constraint if exists revision_queue_tipo_check;

update public.revision_queue
set tipo = 'categoria_ambigua'
where tipo = 'rubro_ambiguo';

alter table public.revision_queue add constraint revision_queue_tipo_check
  check (tipo in (
    'proveedor_ambiguo',
    'posible_duplicado',
    'dato_incompleto',
    'categoria_ambigua'
  ));
