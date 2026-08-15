-- =====================================================
-- UTCJ SUSTENTABLE
-- ESQUEMA INICIAL
-- =====================================================


-- =====================================================
-- 1. ROLES
-- =====================================================

create type public.user_role as enum (
  'admin',
  'user'
);


-- =====================================================
-- 2. PERFILES
-- =====================================================

create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  first_name text not null default '',
  last_name text not null default '',

  role public.user_role not null default 'user',
  active boolean not null default true,

  created_at timestamptz not null default now()
);


-- =====================================================
-- 3. MATERIALES
-- =====================================================

create table public.materials (
  id uuid primary key default gen_random_uuid(),

  name text not null unique,

  co2_factor numeric(10, 4) not null default 0
    check (co2_factor >= 0),

  active boolean not null default true,

  created_at timestamptz not null default now()
);


-- =====================================================
-- 4. RECOLECCIONES
-- =====================================================

create table public.waste_collections (
  id uuid primary key default gen_random_uuid(),

  collection_date date not null,

  material_id uuid not null
    references public.materials(id),

  kilograms numeric(10, 3) not null
    check (kilograms > 0),

  location text,
  notes text,

  created_by uuid not null
    references public.profiles(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =====================================================
-- 5. ÍNDICES
-- =====================================================

create index waste_collections_date_idx
on public.waste_collections(collection_date);

create index waste_collections_material_idx
on public.waste_collections(material_id);

create index waste_collections_created_by_idx
on public.waste_collections(created_by);


-- =====================================================
-- 6. UPDATED_AT AUTOMÁTICO
-- =====================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


create trigger waste_collections_set_updated_at
before update on public.waste_collections
for each row
execute function public.set_updated_at();


-- =====================================================
-- 7. PERFIL AUTOMÁTICO AL CREAR USUARIO
-- =====================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  insert into public.profiles (
    id,
    first_name,
    last_name
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );

  return new;

end;
$$;


create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- =====================================================
-- 8. FUNCIÓN PARA VERIFICAR ADMIN
-- =====================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and active = true
  );
$$;


-- =====================================================
-- 9. RLS
-- =====================================================

alter table public.profiles
enable row level security;

alter table public.materials
enable row level security;

alter table public.waste_collections
enable row level security;


-- =====================================================
-- 10. PERMISOS
-- =====================================================

grant select on public.profiles
to authenticated;

grant update on public.profiles
to authenticated;


grant select, insert, update, delete
on public.materials
to authenticated;


grant select, insert, update, delete
on public.waste_collections
to authenticated;


-- =====================================================
-- 11. POLÍTICAS DE PROFILES
-- =====================================================

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or public.is_admin()
);


create policy "Admins can update profiles"
on public.profiles
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- =====================================================
-- 12. POLÍTICAS DE MATERIALS
-- =====================================================

create policy "Authenticated users can view materials"
on public.materials
for select
to authenticated
using (true);


create policy "Admins can create materials"
on public.materials
for insert
to authenticated
with check (
  public.is_admin()
);


create policy "Admins can update materials"
on public.materials
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


create policy "Admins can delete materials"
on public.materials
for delete
to authenticated
using (
  public.is_admin()
);


-- =====================================================
-- 13. POLÍTICAS DE RECOLECCIONES
-- =====================================================

create policy "Authenticated users can view collections"
on public.waste_collections
for select
to authenticated
using (true);


create policy "Users can create collections"
on public.waste_collections
for insert
to authenticated
with check (
  created_by = (select auth.uid())
);


create policy "Users can update own collections"
on public.waste_collections
for update
to authenticated
using (
  created_by = (select auth.uid())
  or public.is_admin()
)
with check (
  created_by = (select auth.uid())
  or public.is_admin()
);


create policy "Users can delete own collections"
on public.waste_collections
for delete
to authenticated
using (
  created_by = (select auth.uid())
  or public.is_admin()
);