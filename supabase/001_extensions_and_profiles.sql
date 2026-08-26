-- Extensiones base
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;     -- matching difuso de proveedores/rubros

-- =====================================================================
-- profiles: 1:1 con auth.users. Aca vive el ROL, que reemplaza el
-- "usuario compartido" del sistema viejo.
-- =====================================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'compras'
             check (role in ('owner', 'compras', 'ventas')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil y rol de cada usuario. owner ve todo; compras=Marcela; ventas=Julian.';

-- Rol del usuario actual. SECURITY DEFINER para poder leer profiles dentro
-- de las policies sin recursion de RLS.
create or replace function public.auth_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Alta automatica de perfil al crear el usuario. El rol puede venir en
-- app_metadata.role (lo setea el seed / el alta de usuarios del owner).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_app_meta_data ->> 'role', 'compras')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at helper reutilizable
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
