-- Campos extra de la lista del portal del proveedor (categoria, stock).

alter table public.precios
  add column if not exists categoria text,
  add column if not exists subcategoria text,
  add column if not exists stock int;
