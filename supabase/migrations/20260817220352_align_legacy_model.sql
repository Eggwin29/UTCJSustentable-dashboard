-- =====================================================
-- UTCJ SUSTENTABLE
-- ALINEACIÓN CON EL MODELO HISTÓRICO
-- =====================================================


-- =====================================================
-- 1. TIPO DE REGISTRO DE RESIDUOS
-- =====================================================

create type public.waste_record_type as enum (
  'historical',
  'collection'
);


-- =====================================================
-- 2. PERIODOS DE CAPITAL HUMANO
--
-- E-A = Enero - Abril
-- M-A = Mayo - Agosto
-- S-D = Septiembre - Diciembre
-- =====================================================

create type public.academic_term as enum (
  'E-A',
  'M-A',
  'S-D'
);


-- =====================================================
-- 3. ADAPTAR WASTE_COLLECTIONS
--
-- Los datos históricos solamente conocen:
-- año + material + kilogramos.
--
-- Los registros nuevos sí tendrán una fecha específica.
-- =====================================================

alter table public.waste_collections
add column year smallint;


alter table public.waste_collections
add column record_type public.waste_record_type
not null
default 'collection';


-- Los registros históricos no tienen fecha exacta.
alter table public.waste_collections
alter column collection_date drop not null;


-- Los registros históricos tampoco fueron creados
-- por un usuario de nuestro nuevo sistema.
alter table public.waste_collections
alter column created_by drop not null;


-- =====================================================
-- 4. BACKFILL DE REGISTROS EXISTENTES
-- =====================================================

update public.waste_collections
set year = extract(year from collection_date)::smallint
where year is null
  and collection_date is not null;


alter table public.waste_collections
alter column year set not null;


-- =====================================================
-- 5. VALIDACIONES
-- =====================================================

alter table public.waste_collections
add constraint waste_collections_year_check
check (
  year between 2000 and 2100
);


-- Un histórico:
--   - no tiene fecha específica
--   - no tiene creador
--
-- Una colección nueva:
--   - sí tiene fecha
--   - sí tiene usuario
--   - el año debe coincidir con la fecha
alter table public.waste_collections
add constraint waste_collections_record_shape_check
check (
  (
    record_type = 'historical'
    and collection_date is null
    and created_by is null
  )
  or
  (
    record_type = 'collection'
    and collection_date is not null
    and created_by is not null
    and year = extract(year from collection_date)::smallint
  )
);


-- =====================================================
-- 6. ÍNDICES
-- =====================================================

create index waste_collections_year_idx
on public.waste_collections(year);


create index waste_collections_record_type_idx
on public.waste_collections(record_type);


-- Solo puede existir un histórico agregado
-- por año + material.
create unique index waste_collections_historical_unique_idx
on public.waste_collections(year, material_id)
where record_type = 'historical';


-- =====================================================
-- 7. ACTUALIZAR MATERIALES Y FACTORES CO2
-- =====================================================
--
-- Estos factores reproducen los cálculos del
-- dashboard histórico de Power BI.
-- =====================================================

insert into public.materials (
  name,
  co2_factor,
  active
)
values
  ('Cartón',      0.8, true),
  ('Plástico',    1.5, true),
  ('Aluminio',    9.0, true),
  ('Papel',       1.0, true),
  ('Electrónica', 2.0, true),
  ('Pilas',       3.0, true)

on conflict (name)
do update set
  co2_factor = excluded.co2_factor,
  active = excluded.active;


-- =====================================================
-- 8. CAPITAL HUMANO
-- =====================================================

create table public.human_capital (
  id uuid primary key default gen_random_uuid(),

  year smallint not null
    check (year between 2000 and 2100),

  term public.academic_term not null,

  tm_tuesday integer not null
    default 0
    check (tm_tuesday >= 0),

  tv_thursday integer not null
    default 0
    check (tv_thursday >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (year, term)
);


-- =====================================================
-- 9. UPDATED_AT PARA CAPITAL HUMANO
-- =====================================================

create trigger human_capital_set_updated_at
before update on public.human_capital
for each row
execute function public.set_updated_at();


-- =====================================================
-- 10. RLS CAPITAL HUMANO
-- =====================================================

alter table public.human_capital
enable row level security;


grant select, insert, update, delete
on public.human_capital
to authenticated;


create policy "Authenticated users can view human capital"
on public.human_capital
for select
to authenticated
using (true);


create policy "Admins can create human capital"
on public.human_capital
for insert
to authenticated
with check (
  public.is_admin()
);


create policy "Admins can update human capital"
on public.human_capital
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


create policy "Admins can delete human capital"
on public.human_capital
for delete
to authenticated
using (
  public.is_admin()
);


-- =====================================================
-- 11. REFORZAR INSERT DE RECOLECCIONES
--
-- Desde la aplicación normal solo se permiten
-- registros nuevos, no históricos.
-- =====================================================

drop policy if exists
"Users can create collections"
on public.waste_collections;


create policy "Users can create collections"
on public.waste_collections
for insert
to authenticated
with check (
  record_type = 'collection'
  and created_by = (select auth.uid())
  and collection_date is not null
  and year = extract(year from collection_date)::smallint
);