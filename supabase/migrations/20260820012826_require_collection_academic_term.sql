-- =====================================================
-- UTCJ SUSTENTABLE
-- CUATRIMESTRE OBLIGATORIO EN RECOLECCIONES
-- =====================================================


-- =====================================================
-- 1. COMPLETAR RECOLECCIONES POR RANGO
-- =====================================================

update public.waste_collections
  as collection
set academic_term_id =
  academic_term.id
from public.academic_terms
  as academic_term
where
  collection.record_type =
    'collection'
  and collection.academic_term_id
    is null
  and collection.collection_date
    is not null
  and collection.collection_date
    between
      academic_term.start_date
      and academic_term.end_date;


-- =====================================================
-- 2. RESPALDO POR AÑO Y PERIODO
-- =====================================================

update public.waste_collections
  as collection
set academic_term_id =
  academic_term.id
from public.academic_terms
  as academic_term
where
  collection.record_type =
    'collection'
  and collection.academic_term_id
    is null
  and collection.collection_date
    is not null

  and academic_term.year =
    extract(
      year from
      collection.collection_date
    )::smallint

  and academic_term.term = (
    case
      when extract(
        month from
        collection.collection_date
      ) between 1 and 4
        then
          'E-A'::public.academic_term

      when extract(
        month from
        collection.collection_date
      ) between 5 and 8
        then
          'M-A'::public.academic_term

      else
        'S-D'::public.academic_term
    end
  );


-- =====================================================
-- 3. COMPROBAR CASOS PENDIENTES
-- =====================================================

do $$
declare
  collections_without_academic_term
    bigint;
begin
  select count(*)
  into
    collections_without_academic_term
  from public.waste_collections
  where
    record_type = 'collection'
    and academic_term_id is null;

  if
    collections_without_academic_term
      > 0
  then
    raise exception
      'Existen % recolecciones sin cuatrimestre. Asígnalas antes de aplicar la restricción.',
      collections_without_academic_term;
  end if;
end;
$$;


-- =====================================================
-- 4. HACERLO OBLIGATORIO EN RECOLECCIONES
-- =====================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where
      conname =
        'waste_collections_collection_academic_term_check'

      and conrelid =
        'public.waste_collections'::regclass
  ) then
    alter table
      public.waste_collections

    add constraint
      waste_collections_collection_academic_term_check

    check (
      record_type <> 'collection'
      or academic_term_id
        is not null
    );
  end if;
end;
$$;


comment on constraint
  waste_collections_collection_academic_term_check
on public.waste_collections
is
  'Las recolecciones detalladas requieren un cuatrimestre; los registros históricos anuales pueden conservarlo nulo.';