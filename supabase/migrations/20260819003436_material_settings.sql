-- =====================================================
-- UTCJ SUSTENTABLE
-- MATERIALES Y FACTOR HISTÓRICO DE CO2
-- =====================================================


-- =====================================================
-- 1. FACTOR APLICADO EN CADA RECOLECCIÓN
-- =====================================================

alter table public.waste_collections
add column if not exists
co2_factor_applied numeric(10, 4);


update public.waste_collections as collection
set co2_factor_applied = material.co2_factor
from public.materials as material
where material.id = collection.material_id
  and collection.co2_factor_applied is null;


alter table public.waste_collections
alter column co2_factor_applied set default 0;


alter table public.waste_collections
alter column co2_factor_applied set not null;


do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'waste_collections_co2_factor_applied_check'
      and conrelid =
        'public.waste_collections'::regclass
  ) then
    alter table public.waste_collections
    add constraint
      waste_collections_co2_factor_applied_check
    check (co2_factor_applied >= 0);
  end if;
end;
$$;


-- =====================================================
-- 2. ASIGNAR EL FACTOR AUTOMÁTICAMENTE
-- =====================================================

create or replace function
public.set_collection_co2_factor()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if
      new.material_id
        is distinct from old.material_id
    then
      null;
    elsif
      new.co2_factor_applied
        is distinct from old.co2_factor_applied
    then
      raise exception
        'El factor aplicado no puede modificarse directamente.'
        using errcode = '42501';
    else
      return new;
    end if;
  end if;

  select material.co2_factor
  into new.co2_factor_applied
  from public.materials as material
  where material.id = new.material_id;

  if not found then
    raise exception
      'El material seleccionado no existe.'
      using errcode = '23503';
  end if;

  return new;
end;
$$;


revoke all
on function public.set_collection_co2_factor()
from public;


drop trigger if exists
set_collection_co2_factor
on public.waste_collections;


create trigger set_collection_co2_factor
before insert or update
on public.waste_collections
for each row
execute function
public.set_collection_co2_factor();


-- =====================================================
-- 3. EVITAR MATERIALES DUPLICADOS O VACÍOS
-- =====================================================

create unique index if not exists
materials_normalized_name_idx
on public.materials (
  lower(btrim(name))
);


do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'materials_name_not_blank_check'
      and conrelid =
        'public.materials'::regclass
  ) then
    alter table public.materials
    add constraint materials_name_not_blank_check
    check (length(btrim(name)) > 0);
  end if;
end;
$$;


-- =====================================================
-- 4. LOS MATERIALES NO SE ELIMINAN
-- =====================================================

drop policy if exists
"Admins can delete materials"
on public.materials;


revoke delete
on public.materials
from authenticated;