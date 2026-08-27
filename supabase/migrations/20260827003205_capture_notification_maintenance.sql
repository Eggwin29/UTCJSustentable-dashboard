-- =====================================================
-- MANTENIMIENTO AUTOMÁTICO DE NOTIFICACIONES
-- =====================================================

create extension if not exists pg_cron
with schema pg_catalog;

create schema if not exists private
authorization postgres;

revoke all on schema private
from public;

-- =====================================================
-- ELIMINAR NOTIFICACIONES ANTIGUAS
-- =====================================================

create or replace function private.cleanup_old_notifications()
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  deleted_count integer;
begin
  -- Bloquea las notificaciones que serán eliminadas
  -- para evitar nuevas lecturas durante la limpieza.
  perform 1
  from public.notifications
  where created_at <
    now() - interval '6 months'
  for update;

  -- Elimina primero los estados de lectura asociados.
  delete from public.notification_reads as nr
  using public.notifications as n
  where
    nr.notification_id = n.id
    and n.created_at <
      now() - interval '6 months';

  -- Elimina notificaciones globales y personales
  -- con más de seis meses.
  delete from public.notifications
  where created_at <
    now() - interval '6 months';

  get diagnostics
    deleted_count = row_count;

  return deleted_count;
end;
$function$;

revoke all
on function
  private.cleanup_old_notifications()
from public;

revoke all
on function
  private.cleanup_old_notifications()
from anon, authenticated;

-- =====================================================
-- ACTUALIZACIÓN DEL PERFIL PROPIO
-- =====================================================

do $do$
begin
  if not exists (
    select 1
    from pg_policies
    where
      schemaname = 'public'
      and tablename = 'profiles'
      and policyname =
        'Active users can update own profile'
  ) then
    execute $policy$
      create policy
        "Active users can update own profile"
      on public.profiles
      for update
      to authenticated
      using (
        id = (select auth.uid())
        and public.is_active_user()
      )
      with check (
        id = (select auth.uid())
        and public.is_active_user()
      )
    $policy$;
  end if;
end;
$do$;

-- =====================================================
-- TRABAJOS PROGRAMADOS
-- =====================================================

-- Si ya existe un trabajo con el mismo nombre,
-- cron.schedule actualiza su configuración.
select cron.schedule(
  'cleanup-old-notifications',
  '15 3 * * *',
  $cron$
    select
      private.cleanup_old_notifications();
  $cron$
);

select cron.schedule(
  'cleanup-old-cron-history',
  '45 3 * * 0',
  $cron$
    delete from cron.job_run_details
    where
      end_time <
        now() - interval '30 days';
  $cron$
);