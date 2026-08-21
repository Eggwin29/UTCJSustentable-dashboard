-- =====================================================
-- UTCJ SUSTENTABLE
-- CUATRIMESTRES ACADÉMICOS - FASE COMPATIBLE
-- =====================================================


-- =====================================================
-- 1. CATÁLOGO DE CUATRIMESTRES
-- =====================================================

create table if not exists public.academic_terms (
  id uuid primary key default gen_random_uuid(),
  year smallint not null,
  term public.academic_term not null,
  start_date date not null,
  end_date date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint academic_terms_year_check
    check (year between 2022 and 2100),

  constraint academic_terms_date_range_check
    check (start_date <= end_date),

  constraint academic_terms_year_term_key
    unique (year, term)
);


create unique index if not exists
academic_terms_one_current_idx
on public.academic_terms (is_current)
where is_current = true;


create index if not exists
academic_terms_year_idx
on public.academic_terms (year desc);


-- =====================================================
-- 2. UPDATED_AT AUTOMÁTICO
-- =====================================================

create or replace function
public.set_academic_term_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


revoke all
on function public.set_academic_term_updated_at()
from public;


drop trigger if exists
set_academic_term_updated_at
on public.academic_terms;


create trigger set_academic_term_updated_at
before update
on public.academic_terms
for each row
execute function
public.set_academic_term_updated_at();


-- =====================================================
-- 3. MIGRAR CUATRIMESTRES DE CAPITAL HUMANO
-- =====================================================

insert into public.academic_terms (
  year,
  term,
  start_date,
  end_date
)
select distinct
  capital.year::smallint,
  capital.term,

  case capital.term::text
    when 'E-A' then make_date(capital.year, 1, 1)
    when 'M-A' then make_date(capital.year, 5, 1)
    else make_date(capital.year, 9, 1)
  end,

  case capital.term::text
    when 'E-A' then make_date(capital.year, 4, 30)
    when 'M-A' then make_date(capital.year, 8, 31)
    else make_date(capital.year, 12, 31)
  end

from public.human_capital as capital
on conflict (year, term) do nothing;


-- =====================================================
-- 4. MIGRAR CUATRIMESTRES DE RECOLECCIONES DETALLADAS
-- =====================================================

insert into public.academic_terms (
  year,
  term,
  start_date,
  end_date
)
select distinct
  extract(year from collection.collection_date)::smallint,

  case
    when extract(month from collection.collection_date)
      between 1 and 4
      then 'E-A'::public.academic_term

    when extract(month from collection.collection_date)
      between 5 and 8
      then 'M-A'::public.academic_term

    else 'S-D'::public.academic_term
  end,

  case
    when extract(month from collection.collection_date)
      between 1 and 4
      then make_date(
        extract(year from collection.collection_date)::integer,
        1,
        1
      )

    when extract(month from collection.collection_date)
      between 5 and 8
      then make_date(
        extract(year from collection.collection_date)::integer,
        5,
        1
      )

    else make_date(
      extract(year from collection.collection_date)::integer,
      9,
      1
    )
  end,

  case
    when extract(month from collection.collection_date)
      between 1 and 4
      then make_date(
        extract(year from collection.collection_date)::integer,
        4,
        30
      )

    when extract(month from collection.collection_date)
      between 5 and 8
      then make_date(
        extract(year from collection.collection_date)::integer,
        8,
        31
      )

    else make_date(
      extract(year from collection.collection_date)::integer,
      12,
      31
    )
  end

from public.waste_collections as collection
where collection.record_type = 'collection'
  and collection.collection_date is not null
on conflict (year, term) do nothing;


-- =====================================================
-- 5. RELACIÓN CON CAPITAL HUMANO
-- =====================================================

alter table public.human_capital
add column if not exists academic_term_id uuid;


update public.human_capital as capital
set academic_term_id = academic_term.id
from public.academic_terms as academic_term
where academic_term.year = capital.year
  and academic_term.term = capital.term
  and capital.academic_term_id is null;


do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'human_capital_academic_term_id_fkey'
      and conrelid =
        'public.human_capital'::regclass
  ) then
    alter table public.human_capital
    add constraint
      human_capital_academic_term_id_fkey
    foreign key (academic_term_id)
    references public.academic_terms (id)
    on delete restrict;
  end if;
end;
$$;


create unique index if not exists
human_capital_academic_term_id_idx
on public.human_capital (academic_term_id)
where academic_term_id is not null;


-- =====================================================
-- 6. RELACIÓN CON RECOLECCIONES
-- =====================================================

alter table public.waste_collections
add column if not exists academic_term_id uuid;


update public.waste_collections as collection
set academic_term_id = academic_term.id
from public.academic_terms as academic_term
where collection.record_type = 'collection'
  and collection.collection_date is not null
  and academic_term.year =
    extract(year from collection.collection_date)::smallint
  and academic_term.term = (
    case
      when extract(month from collection.collection_date)
        between 1 and 4
        then 'E-A'::public.academic_term

      when extract(month from collection.collection_date)
        between 5 and 8
        then 'M-A'::public.academic_term

      else 'S-D'::public.academic_term
    end
  )
  and collection.academic_term_id is null;


do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'waste_collections_academic_term_id_fkey'
      and conrelid =
        'public.waste_collections'::regclass
  ) then
    alter table public.waste_collections
    add constraint
      waste_collections_academic_term_id_fkey
    foreign key (academic_term_id)
    references public.academic_terms (id)
    on delete restrict;
  end if;
end;
$$;


create index if not exists
waste_collections_academic_term_id_idx
on public.waste_collections (academic_term_id);


-- academic_term_id permanece nullable durante esta fase.
-- Así, aplicar esta migración no rompe el frontend actual.
-- La siguiente migración lo hará obligatorio para record_type = 'collection'.


-- =====================================================
-- 7. SELECCIONAR EL CUATRIMESTRE ACTUAL
-- =====================================================

create or replace function
public.set_current_academic_term(
  target_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception
      'Solo un administrador puede cambiar el cuatrimestre actual.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.academic_terms
    where id = target_id
  ) then
    raise exception
      'El cuatrimestre seleccionado no existe.'
      using errcode = 'P0002';
  end if;

  update public.academic_terms
  set is_current = false
  where is_current = true
    and id <> target_id;

  update public.academic_terms
  set is_current = true
  where id = target_id;

  return target_id;
end;
$$;


revoke all
on function public.set_current_academic_term(uuid)
from public;


grant execute
on function public.set_current_academic_term(uuid)
to authenticated;


-- =====================================================
-- 8. SEGURIDAD RLS
-- =====================================================

alter table public.academic_terms
enable row level security;


revoke all
on public.academic_terms
from anon;


revoke all
on public.academic_terms
from authenticated;


grant select, insert, update
on public.academic_terms
to authenticated;


drop policy if exists
"Authenticated users can read academic terms"
on public.academic_terms;


create policy
"Authenticated users can read academic terms"
on public.academic_terms
for select
to authenticated
using (true);


drop policy if exists
"Admins can insert academic terms"
on public.academic_terms;


create policy
"Admins can insert academic terms"
on public.academic_terms
for insert
to authenticated
with check (public.is_admin());


drop policy if exists
"Admins can update academic terms"
on public.academic_terms;


create policy
"Admins can update academic terms"
on public.academic_terms
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


revoke delete
on public.academic_terms
from authenticated;