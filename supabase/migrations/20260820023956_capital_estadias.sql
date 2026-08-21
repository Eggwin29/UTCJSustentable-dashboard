-- =====================================================
-- UTCJ SUSTENTABLE
-- CAPITAL ESTADÍAS
-- =====================================================

do $$
begin
  create type public.academic_level
  as enum (
    'TSU',
    'Licenciatura',
    'Sin especificar'
  );
exception
  when duplicate_object then null;
end;
$$;


-- CATÁLOGO DE CARRERAS

create table if not exists public.academic_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint academic_programs_name_key
    unique (name),

  constraint academic_programs_name_check
    check (
      name = btrim(name)
      and char_length(name) between 1 and 120
    )
);

create index if not exists
academic_programs_active_name_idx
on public.academic_programs (
  active,
  name
);


-- PARTICIPACIÓN DE ESTADÍAS

create table if not exists public.internship_participation (
  id uuid primary key default gen_random_uuid(),

  academic_term_id uuid not null
    references public.academic_terms (id)
    on delete restrict,

  academic_program_id uuid not null
    references public.academic_programs (id)
    on delete restrict,

  academic_level public.academic_level
    not null
    default 'Sin especificar',

  participant_count integer not null,

  notes text,

  created_by uuid
    references public.profiles (id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint internship_participation_count_check
    check (
      participant_count between 1 and 1000000
    ),

  constraint internship_participation_notes_check
    check (
      notes is null
      or char_length(notes) <= 1000
    ),

  constraint internship_participation_unique_record
    unique (
      academic_term_id,
      academic_program_id,
      academic_level
    )
);

create index if not exists
internship_participation_term_idx
on public.internship_participation (
  academic_term_id
);

create index if not exists
internship_participation_program_idx
on public.internship_participation (
  academic_program_id
);


-- AUDITORÍA AUTOMÁTICA

create or replace function
public.prepare_academic_program()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.name = btrim(new.name);
  new.updated_at = now();

  return new;
end;
$$;

revoke all
on function public.prepare_academic_program()
from public;

drop trigger if exists
prepare_academic_program
on public.academic_programs;

create trigger prepare_academic_program
before insert or update
on public.academic_programs
for each row
execute function
public.prepare_academic_program();


create or replace function
public.prepare_internship_participation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.notes = nullif(btrim(new.notes), '');
  new.updated_at = now();

  if tg_op = 'INSERT' then
    new.created_by = auth.uid();
  else
    new.created_by = old.created_by;
  end if;

  return new;
end;
$$;

revoke all
on function
public.prepare_internship_participation()
from public;

drop trigger if exists
prepare_internship_participation
on public.internship_participation;

create trigger
prepare_internship_participation
before insert or update
on public.internship_participation
for each row
execute function
public.prepare_internship_participation();


-- CATÁLOGO INICIAL

insert into public.academic_programs (
  name
)
values
  ('Ciber'),
  ('Software'),
  ('Desarrollo de negocios'),
  ('Mecatrónica'),
  ('Procesos'),
  ('Mantenimiento')
on conflict (name)
do update set
  active = true;


-- IMPORTACIÓN NORMALIZADA DEL EXCEL

with source_data (
  year,
  term,
  program_name,
  academic_level,
  participant_count
) as (
  values
    (2024, 'S-D', 'Desarrollo de negocios', 'TSU', 1),
    (2025, 'E-A', 'Procesos', 'TSU', 1),
    (2025, 'M-A', 'Software', 'Sin especificar', 3),
    (2025, 'M-A', 'Desarrollo de negocios', 'Licenciatura', 1),
    (2025, 'M-A', 'Desarrollo de negocios', 'TSU', 3),
    (2025, 'S-D', 'Desarrollo de negocios', 'Sin especificar', 1),
    (2025, 'S-D', 'Procesos', 'Sin especificar', 1),
    (2025, 'S-D', 'Mantenimiento', 'Sin especificar', 1)
)
insert into public.internship_participation (
  academic_term_id,
  academic_program_id,
  academic_level,
  participant_count
)
select
  academic_term.id,
  academic_program.id,
  source.academic_level::public.academic_level,
  source.participant_count
from source_data as source
join public.academic_terms as academic_term
  on academic_term.year = source.year
  and academic_term.term::text = source.term
join public.academic_programs as academic_program
  on academic_program.name = source.program_name
on conflict (
  academic_term_id,
  academic_program_id,
  academic_level
)
do update set
  participant_count = excluded.participant_count;


-- VALIDAR IMPORTACIÓN

do $$
declare
  imported_rows integer;
  imported_total integer;
begin
  with expected (
    year,
    term,
    program_name,
    academic_level
  ) as (
    values
      (2024, 'S-D', 'Desarrollo de negocios', 'TSU'),
      (2025, 'E-A', 'Procesos', 'TSU'),
      (2025, 'M-A', 'Software', 'Sin especificar'),
      (2025, 'M-A', 'Desarrollo de negocios', 'Licenciatura'),
      (2025, 'M-A', 'Desarrollo de negocios', 'TSU'),
      (2025, 'S-D', 'Desarrollo de negocios', 'Sin especificar'),
      (2025, 'S-D', 'Procesos', 'Sin especificar'),
      (2025, 'S-D', 'Mantenimiento', 'Sin especificar')
  )
  select
    count(*)::integer,
    coalesce(
      sum(participation.participant_count),
      0
    )::integer
  into
    imported_rows,
    imported_total
  from expected
  join public.academic_terms as academic_term
    on academic_term.year = expected.year
    and academic_term.term::text = expected.term
  join public.academic_programs as academic_program
    on academic_program.name = expected.program_name
  join public.internship_participation as participation
    on participation.academic_term_id = academic_term.id
    and participation.academic_program_id = academic_program.id
    and participation.academic_level::text =
      expected.academic_level;

  if imported_rows <> 8
    or imported_total <> 12
  then
    raise exception
      'La importación de Capital estadías no coincide con el Excel: % filas y % participaciones.',
      imported_rows,
      imported_total;
  end if;
end;
$$;


-- SEGURIDAD RLS

alter table public.academic_programs
enable row level security;

alter table public.internship_participation
enable row level security;

revoke all
on public.academic_programs
from anon, authenticated;

revoke all
on public.internship_participation
from anon, authenticated;

grant select
on public.academic_programs
to authenticated;

grant select, insert, update
on public.internship_participation
to authenticated;

drop policy if exists
"Active users can read academic programs"
on public.academic_programs;

drop policy if exists
"Active users can read internship participation"
on public.internship_participation;

drop policy if exists
"Admins can insert internship participation"
on public.internship_participation;

drop policy if exists
"Admins can update internship participation"
on public.internship_participation;

create policy
"Active users can read academic programs"
on public.academic_programs
for select
to authenticated
using (public.is_active_user());

create policy
"Active users can read internship participation"
on public.internship_participation
for select
to authenticated
using (public.is_active_user());

create policy
"Admins can insert internship participation"
on public.internship_participation
for insert
to authenticated
with check (public.is_admin());

create policy
"Admins can update internship participation"
on public.internship_participation
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

comment on table
public.internship_participation
is
'Participación agregada de estadías por cuatrimestre, carrera y nivel académico.';