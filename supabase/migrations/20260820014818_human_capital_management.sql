-- =====================================================
-- UTCJ SUSTENTABLE
-- ADMINISTRACIÓN DE CAPITAL HUMANO
-- =====================================================


-- =====================================================
-- 1. CAMPOS ADMINISTRATIVOS
-- =====================================================

alter table public.human_capital
add column if not exists notes text;


alter table public.human_capital
add column if not exists created_by uuid;


do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname =
      'human_capital_created_by_fkey'
      and conrelid =
        'public.human_capital'::regclass
  ) then
    alter table public.human_capital
    add constraint
      human_capital_created_by_fkey
    foreign key (created_by)
    references public.profiles (id)
    on delete set null;
  end if;
end;
$$;


alter table public.human_capital
drop constraint if exists
human_capital_notes_length_check;


alter table public.human_capital
add constraint
human_capital_notes_length_check
check (
  notes is null
  or char_length(notes) <= 1000
);


alter table public.human_capital
drop constraint if exists
human_capital_tm_tuesday_check;


alter table public.human_capital
add constraint
human_capital_tm_tuesday_check
check (
  tm_tuesday between 0 and 1000000
);


alter table public.human_capital
drop constraint if exists
human_capital_tv_thursday_check;


alter table public.human_capital
add constraint
human_capital_tv_thursday_check
check (
  tv_thursday between 0 and 1000000
);


-- =====================================================
-- 2. EXIGIR UN CUATRIMESTRE
-- =====================================================

do $$
begin
  if exists (
    select 1
    from public.human_capital
    where academic_term_id is null
  ) then
    raise exception
      'Existen registros de Capital humano sin cuatrimestre.';
  end if;
end;
$$;


alter table public.human_capital
alter column academic_term_id
set not null;


-- =====================================================
-- 3. SINCRONIZACIÓN Y AUDITORÍA AUTOMÁTICAS
-- =====================================================

create or replace function
public.prepare_human_capital_record()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  selected_year smallint;
  selected_term
    public.academic_term;
begin
  select
    academic_term.year,
    academic_term.term
  into
    selected_year,
    selected_term
  from public.academic_terms
    as academic_term
  where academic_term.id =
    new.academic_term_id;

  if not found then
    raise exception
      'El cuatrimestre seleccionado no existe.'
      using errcode = '23503';
  end if;

  new.year = selected_year;
  new.term = selected_term;
  new.updated_at = now();

  if tg_op = 'INSERT' then
    new.created_by = auth.uid();
  else
    new.created_by =
      old.created_by;
  end if;

  return new;
end;
$$;


revoke all
on function
public.prepare_human_capital_record()
from public;


drop trigger if exists
prepare_human_capital_record
on public.human_capital;


create trigger
prepare_human_capital_record
before insert or update
on public.human_capital
for each row
execute function
public.prepare_human_capital_record();


-- =====================================================
-- 4. SEGURIDAD RLS
-- =====================================================

alter table public.human_capital
enable row level security;


revoke all
on public.human_capital
from anon;


revoke all
on public.human_capital
from authenticated;


grant select, insert, update
on public.human_capital
to authenticated;


do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename =
        'human_capital'
  loop
    execute format(
      'drop policy if exists %I on public.human_capital',
      existing_policy.policyname
    );
  end loop;
end;
$$;


create policy
"Authenticated users can read human capital"
on public.human_capital
for select
to authenticated
using (true);


create policy
"Admins can insert human capital"
on public.human_capital
for insert
to authenticated
with check (
  public.is_admin()
);


create policy
"Admins can update human capital"
on public.human_capital
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


revoke delete
on public.human_capital
from authenticated;


comment on column
public.human_capital.notes
is
'Observaciones opcionales del resultado agregado del cuatrimestre.';


comment on column
public.human_capital.created_by
is
'Administrador que creó el registro; permanece nulo para datos históricos importados.';