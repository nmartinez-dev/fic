-- =====================================================================
-- Realtime para el calendario colaborativo: si dos personas están mirando
-- los vencimientos y una mueve o paga uno, la otra lo ve en el momento.
-- Realtime respeta las policies RLS (solo llegan cambios de filas visibles).
-- =====================================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'vencimientos'
  ) then
    alter publication supabase_realtime add table public.vencimientos;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'avisos'
  ) then
    alter publication supabase_realtime add table public.avisos;
  end if;
end $$;
