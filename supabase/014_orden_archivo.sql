-- Documento adjunto a la orden de compra (PDF, Excel, imagen).
-- Requiere bucket privado `ordenes` en Supabase Storage (mismo esquema que `facturas`).

alter table public.ordenes_compra
  add column if not exists archivo_path text;
