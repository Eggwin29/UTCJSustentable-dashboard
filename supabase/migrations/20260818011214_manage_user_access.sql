-- =====================================================
-- UTCJ SUSTENTABLE
-- ADMINISTRACIÓN SEGURA DE USUARIOS
-- =====================================================


-- =====================================================
-- 1. VERIFICAR QUE EL USUARIO ACTUAL ESTÉ ACTIVO
-- =====================================================

create or replace function public.is_active_user()
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
      and active = true
  );
$$;

revoke all
on function public.is_active_user()
from public;

grant execute
on function public.is_active_user()
to authenticated;


-- =====================================================
-- 2. PROTEGER ADMINISTRADORES
-- =====================================================

create or replace function public.protect_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if
    new.role is distinct from old.role
    or new.active is distinct from old.active
  then
    if old.id = (select auth.uid()) then
      raise exception
        'No puedes cambiar tu propio rol ni desactivar tu cuenta.'
        using errcode = '42501';
    end if;

    if
      old.role = 'admin'
      and old.active = true
      and (
        new.role <> 'admin'
        or new.active = false
      )
      and not exists (
        select 1
        from public.profiles
        where id <> old.id
          and role = 'admin'
          and active = true
      )
    then
      raise exception
        'Debe existir al menos un administrador activo.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

revoke all
on function public.protect_admin_profile()
from public;

drop trigger if exists protect_admin_profile
on public.profiles;

create trigger protect_admin_profile
before update of role, active
on public.profiles
for each row
execute function public.protect_admin_profile();


-- =====================================================
-- 3. MATERIALES
-- =====================================================

drop policy if exists
"Authenticated users can view materials"
on public.materials;

drop policy if exists
"Active users can view materials"
on public.materials;

create policy "Active users can view materials"
on public.materials
for select
to authenticated
using (
  public.is_active_user()
);


-- =====================================================
-- 4. RECOLECCIONES
-- =====================================================

drop policy if exists
"Authenticated users can view collections"
on public.waste_collections;

drop policy if exists
"Active users can view collections"
on public.waste_collections;

create policy "Active users can view collections"
on public.waste_collections
for select
to authenticated
using (
  public.is_active_user()
);


drop policy if exists
"Users can create collections"
on public.waste_collections;

drop policy if exists
"Active users can create collections"
on public.waste_collections;

create policy "Active users can create collections"
on public.waste_collections
for insert
to authenticated
with check (
  public.is_active_user()
  and record_type = 'collection'
  and created_by = (select auth.uid())
  and collection_date is not null
  and year = extract(year from collection_date)::smallint
);


drop policy if exists
"Users can update own collections"
on public.waste_collections;

drop policy if exists
"Active users can update own collections"
on public.waste_collections;

create policy "Active users can update own collections"
on public.waste_collections
for update
to authenticated
using (
  public.is_active_user()
  and record_type = 'collection'
  and (
    created_by = (select auth.uid())
    or public.is_admin()
  )
)
with check (
  public.is_active_user()
  and record_type = 'collection'
  and created_by is not null
  and collection_date is not null
  and year = extract(year from collection_date)::smallint
  and (
    created_by = (select auth.uid())
    or public.is_admin()
  )
);


drop policy if exists
"Users can delete own collections"
on public.waste_collections;

drop policy if exists
"Active users can delete own collections"
on public.waste_collections;

create policy "Active users can delete own collections"
on public.waste_collections
for delete
to authenticated
using (
  public.is_active_user()
  and record_type = 'collection'
  and (
    created_by = (select auth.uid())
    or public.is_admin()
  )
);


-- =====================================================
-- 5. CAPITAL HUMANO
-- =====================================================

drop policy if exists
"Authenticated users can view human capital"
on public.human_capital;

drop policy if exists
"Active users can view human capital"
on public.human_capital;

create policy "Active users can view human capital"
on public.human_capital
for select
to authenticated
using (
  public.is_active_user()
);