begin;

-- =====================================================
-- 1. POLÍTICAS PARA USUARIOS ACTIVOS
-- =====================================================

alter policy
  "Authenticated users can read academic terms"
on public.academic_terms
using (
  public.is_active_user()
);

alter policy
  "Authenticated users can read human capital"
on public.human_capital
using (
  public.is_active_user()
);

alter policy
  "Usuarios pueden consultar sus notificaciones"
on public.notifications
using (
  public.is_active_user()
  and (
    audience = 'all'

    or (
      audience = 'user'
      and recipient_id = auth.uid()
    )

    or (
      audience = 'admin'
      and public.is_admin()
    )
  )
);

alter policy
  "Usuarios pueden consultar sus lecturas"
on public.notification_reads
using (
  user_id = auth.uid()
  and public.is_active_user()
);

alter policy
  "Usuarios pueden registrar sus lecturas"
on public.notification_reads
with check (
  user_id = auth.uid()
  and public.is_active_user()
);

-- =====================================================
-- 2. PROTEGER CAMPOS CRÍTICOS DEL PERFIL
-- =====================================================

create or replace function
  public.protect_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  -- El identificador del perfil nunca
  -- debe modificarse.
  if new.id is distinct from old.id then
    raise exception
      'El identificador del perfil no puede modificarse.'
      using errcode = '42501';
  end if;

  -- La fecha de creación es inmutable.
  if
    new.created_at
      is distinct from
    old.created_at
  then
    raise exception
      'La fecha de creación del perfil no puede modificarse.'
      using errcode = '42501';
  end if;

  if
    new.role is distinct from old.role
    or new.active is distinct from old.active
  then
    -- Ningún usuario puede cambiar
    -- su propio rol o desactivarse.
    if old.id = auth.uid() then
      raise exception
        'No puedes cambiar tu propio rol ni desactivar tu cuenta.'
        using errcode = '42501';
    end if;

    -- Refuerzo adicional por si la
    -- función fuera llamada fuera de RLS.
    if not public.is_admin() then
      raise exception
        'Solo un administrador puede modificar roles o estados de acceso.'
        using errcode = '42501';
    end if;

    -- Siempre debe permanecer al menos
    -- un administrador activo.
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
        where
          id <> old.id
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
$function$;

-- =====================================================
-- 3. CORREGIR NOTIFICACIÓN DE CUATRIMESTRE
-- =====================================================

create or replace function
  public.notify_current_academic_term_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  academic_term_label text;
begin
  -- No genera notificaciones al editar fechas
  -- u otros campos del cuatrimestre.
  if not (
    old.is_current
      is distinct from
    new.is_current
    and new.is_current = true
  ) then
    return new;
  end if;

  academic_term_label :=
    replace(
      new.term::text,
      '-',
      ' - '
    )
    || ' '
    || new.year::text;

  insert into public.notifications (
    kind,
    audience,
    recipient_id,
    title,
    message,
    link,
    created_by
  )
  values (
    'academic_term',
    'all',
    null,
    'Nuevo cuatrimestre actual',

    academic_term_label
      || ' fue establecido como el cuatrimestre actual para los nuevos registros.',

    '/',
    auth.uid()
  );

  return new;
end;
$function$;

-- =====================================================
-- 4. GARANTIZAR UN SOLO CUATRIMESTRE ACTUAL
-- =====================================================

create unique index
  if not exists
  academic_terms_single_current_idx
on public.academic_terms (
  is_current
)
where is_current = true;

-- =====================================================
-- 5. UN REGISTRO DE CAPITAL HUMANO POR PERIODO
-- =====================================================

create unique index
  if not exists
  human_capital_academic_term_id_key
on public.human_capital (
  academic_term_id
);

-- =====================================================
-- 6. NOMBRES ÚNICOS SIN IMPORTAR MAYÚSCULAS
-- =====================================================

create unique index
  if not exists
  materials_normalized_name_key
on public.materials (
  lower(
    btrim(name)
  )
);

create unique index
  if not exists
  academic_programs_normalized_name_key
on public.academic_programs (
  lower(
    btrim(name)
  )
);

-- =====================================================
-- 7. RESTRICCIONES ADICIONALES
-- =====================================================

do $block$
begin
  if not exists (
    select 1
    from pg_constraint
    where
      conname =
        'materials_name_length_check'
      and conrelid =
        'public.materials'::regclass
  ) then
    alter table public.materials
      add constraint
        materials_name_length_check
      check (
        char_length(
          btrim(name)
        ) between 2 and 120
      )
      not valid;
  end if;
end;
$block$;

alter table public.materials
  validate constraint
    materials_name_length_check;

do $block$
begin
  if not exists (
    select 1
    from pg_constraint
    where
      conname =
        'materials_co2_factor_upper_check'
      and conrelid =
        'public.materials'::regclass
  ) then
    alter table public.materials
      add constraint
        materials_co2_factor_upper_check
      check (
        co2_factor <=
          999999.9999
      )
      not valid;
  end if;
end;
$block$;

alter table public.materials
  validate constraint
    materials_co2_factor_upper_check;

do $block$
begin
  if not exists (
    select 1
    from pg_constraint
    where
      conname =
        'academic_terms_dates_match_year_check'
      and conrelid =
        'public.academic_terms'::regclass
  ) then
    alter table public.academic_terms
      add constraint
        academic_terms_dates_match_year_check
      check (
        extract(
          year from start_date
        )::integer = year

        and extract(
          year from end_date
        )::integer = year
      )
      not valid;
  end if;
end;
$block$;

alter table public.academic_terms
  validate constraint
    academic_terms_dates_match_year_check;

do $block$
begin
  if not exists (
    select 1
    from pg_constraint
    where
      conname =
        'human_capital_supported_year_check'
      and conrelid =
        'public.human_capital'::regclass
  ) then
    alter table public.human_capital
      add constraint
        human_capital_supported_year_check
      check (
        year between 2022 and 2100
      )
      not valid;
  end if;
end;
$block$;

alter table public.human_capital
  validate constraint
    human_capital_supported_year_check;

-- =====================================================
-- 8. ELIMINAR PERMISOS ANÓNIMOS
-- =====================================================

revoke all privileges
on table
  public.profiles,
  public.materials,
  public.academic_terms,
  public.academic_programs,
  public.waste_collections,
  public.human_capital,
  public.internship_participation,
  public.notifications,
  public.notification_reads
from anon;

-- =====================================================
-- 9. PERMISOS MÍNIMOS PARA AUTHENTICATED
-- =====================================================

revoke all privileges
on table
  public.profiles,
  public.materials,
  public.academic_terms,
  public.academic_programs,
  public.waste_collections,
  public.human_capital,
  public.internship_participation,
  public.notifications,
  public.notification_reads
from authenticated;

grant
  select,
  update
on table public.profiles
to authenticated;

grant
  select,
  insert,
  update
on table public.materials
to authenticated;

grant
  select,
  insert,
  update
on table public.academic_terms
to authenticated;

grant
  select,
  insert,
  update
on table public.academic_programs
to authenticated;

grant
  select,
  insert,
  update,
  delete
on table public.waste_collections
to authenticated;

grant
  select,
  insert,
  update
on table public.human_capital
to authenticated;

grant
  select,
  insert,
  update
on table
  public.internship_participation
to authenticated;

grant select
on table public.notifications
to authenticated;

grant
  select,
  insert
on table public.notification_reads
to authenticated;

-- =====================================================
-- 10. PROTEGER FUNCIONES DE TRIGGERS
-- =====================================================

do $block$
declare
  trigger_function record;
begin
  for trigger_function in
    select
      namespace.nspname
        as schema_name,

      procedure.proname
        as function_name,

      pg_get_function_identity_arguments(
        procedure.oid
      ) as function_arguments

    from pg_proc procedure

    join pg_namespace namespace
      on namespace.oid =
        procedure.pronamespace

    where
      namespace.nspname = 'public'

      and procedure.prorettype =
        'pg_catalog.trigger'::regtype
  loop
    execute format(
      'revoke all privileges on function %I.%I(%s) from public, anon, authenticated',
      trigger_function.schema_name,
      trigger_function.function_name,
      trigger_function.function_arguments
    );
  end loop;
end;
$block$;

-- =====================================================
-- 11. PERMISOS DE FUNCIONES UTILIZADAS POR LA APP
-- =====================================================

revoke all privileges
on function public.is_admin()
from public, anon, authenticated;

revoke all privileges
on function public.is_active_user()
from public, anon, authenticated;

revoke all privileges
on function
  public.set_current_academic_term(uuid)
from public, anon, authenticated;

revoke all privileges
on function
  public.get_recent_notifications(integer)
from public, anon, authenticated;

revoke all privileges
on function
  public.get_unread_notification_count()
from public, anon, authenticated;

revoke all privileges
on function
  public.mark_notification_read(uuid)
from public, anon, authenticated;

revoke all privileges
on function
  public.mark_all_notifications_read()
from public, anon, authenticated;

grant execute
on function public.is_admin()
to authenticated;

grant execute
on function public.is_active_user()
to authenticated;

grant execute
on function
  public.set_current_academic_term(uuid)
to authenticated;

grant execute
on function
  public.get_recent_notifications(integer)
to authenticated;

grant execute
on function
  public.get_unread_notification_count()
to authenticated;

grant execute
on function
  public.mark_notification_read(uuid)
to authenticated;

grant execute
on function
  public.mark_all_notifications_read()
to authenticated;

-- =====================================================
-- 12. PERMISOS PREDETERMINADOS FUTUROS
-- =====================================================

alter default privileges
in schema public
revoke all
on tables
from anon;

alter default privileges
in schema public
revoke execute
on functions
from public;

alter default privileges
in schema public
revoke execute
on functions
from anon;

commit;