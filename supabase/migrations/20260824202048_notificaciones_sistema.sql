begin;

-- =====================================================
-- 1. NOTIFICACIONES DEL SISTEMA
-- =====================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),

  kind text not null default 'system'
    check (
      kind in (
        'academic_term',
        'account',
        'system',
        'warning'
      )
    ),

  audience text not null default 'all'
    check (
      audience in (
        'all',
        'admin',
        'user'
      )
    ),

  recipient_id uuid null
    references public.profiles(id)
    on delete cascade,

  title text not null
    check (
      char_length(trim(title)) between 1 and 120
    ),

  message text not null
    check (
      char_length(trim(message)) between 1 and 500
    ),

  link text null,

  created_by uuid null
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null default now(),

  constraint notifications_recipient_check
    check (
      (
        audience = 'user'
        and recipient_id is not null
      )
      or
      (
        audience in ('all', 'admin')
        and recipient_id is null
      )
    )
);

create index notifications_created_at_idx
  on public.notifications(created_at desc);

create index notifications_recipient_id_idx
  on public.notifications(recipient_id);

create index notifications_audience_idx
  on public.notifications(audience);


-- =====================================================
-- 2. ESTADO LEÍDO POR USUARIO
-- =====================================================

create table public.notification_reads (
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  notification_id uuid not null
    references public.notifications(id)
    on delete cascade,

  read_at timestamptz not null default now(),

  primary key (
    user_id,
    notification_id
  )
);

create index notification_reads_notification_id_idx
  on public.notification_reads(notification_id);


-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================

alter table public.notifications
  enable row level security;

alter table public.notification_reads
  enable row level security;


-- Cada usuario solamente puede consultar:
-- 1. Notificaciones para todos.
-- 2. Notificaciones dirigidas a su cuenta.
-- 3. Notificaciones administrativas si es administrador.

create policy "Usuarios pueden consultar sus notificaciones"
on public.notifications
for select
to authenticated
using (
  audience = 'all'
  or recipient_id = auth.uid()
  or (
    audience = 'admin'
    and public.is_admin()
  )
);


-- Cada usuario solamente puede consultar
-- sus propias confirmaciones de lectura.

create policy "Usuarios pueden consultar sus lecturas"
on public.notification_reads
for select
to authenticated
using (
  user_id = auth.uid()
);


-- Cada usuario solamente puede marcar
-- sus propias notificaciones como leídas.

create policy "Usuarios pueden registrar sus lecturas"
on public.notification_reads
for insert
to authenticated
with check (
  user_id = auth.uid()
);


grant select
on public.notifications
to authenticated;

grant select, insert
on public.notification_reads
to authenticated;


-- =====================================================
-- 4. OBTENER NOTIFICACIONES RECIENTES
-- =====================================================

create function public.get_recent_notifications(
  limit_count integer default 8
)
returns table (
  id uuid,
  notification_kind text,
  title text,
  message text,
  link text,
  created_at timestamptz,
  read_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    notification.id,
    notification.kind as notification_kind,
    notification.title,
    notification.message,
    notification.link,
    notification.created_at,
    notification_read.read_at
  from public.notifications as notification
  left join public.notification_reads as notification_read
    on notification_read.notification_id = notification.id
    and notification_read.user_id = auth.uid()
  order by notification.created_at desc
  limit least(
    greatest(
      coalesce(limit_count, 8),
      1
    ),
    50
  );
$$;


-- =====================================================
-- 5. CONTAR NOTIFICACIONES SIN LEER
-- =====================================================

create function public.get_unread_notification_count()
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::integer
  from public.notifications as notification
  left join public.notification_reads as notification_read
    on notification_read.notification_id = notification.id
    and notification_read.user_id = auth.uid()
  where notification_read.notification_id is null;
$$;


-- =====================================================
-- 6. MARCAR UNA NOTIFICACIÓN COMO LEÍDA
-- =====================================================

create function public.mark_notification_read(
  target_notification_id uuid
)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.notification_reads (
    user_id,
    notification_id,
    read_at
  )
  select
    auth.uid(),
    notification.id,
    now()
  from public.notifications as notification
  where
    notification.id = target_notification_id
    and auth.uid() is not null
  on conflict (
    user_id,
    notification_id
  )
  do nothing;
$$;


-- =====================================================
-- 7. MARCAR TODAS COMO LEÍDAS
-- =====================================================

create function public.mark_all_notifications_read()
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.notification_reads (
    user_id,
    notification_id,
    read_at
  )
  select
    auth.uid(),
    notification.id,
    now()
  from public.notifications as notification
  where auth.uid() is not null
  on conflict (
    user_id,
    notification_id
  )
  do nothing;
$$;


revoke all
on function public.get_recent_notifications(integer)
from public;

revoke all
on function public.get_unread_notification_count()
from public;

revoke all
on function public.mark_notification_read(uuid)
from public;

revoke all
on function public.mark_all_notifications_read()
from public;


grant execute
on function public.get_recent_notifications(integer)
to authenticated;

grant execute
on function public.get_unread_notification_count()
to authenticated;

grant execute
on function public.mark_notification_read(uuid)
to authenticated;

grant execute
on function public.mark_all_notifications_read()
to authenticated;


-- =====================================================
-- 8. NOTIFICAR CAMBIO DE CUATRIMESTRE ACTUAL
-- =====================================================

create function public.notify_current_academic_term_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  academic_term_label text;
begin
  academic_term_label :=
    replace(new.term::text, '-', ' - ')
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
$$;

revoke all
on function public.notify_current_academic_term_change()
from public;

create trigger notify_current_academic_term_change_trigger
after update of is_current
on public.academic_terms
for each row
when (
  new.is_current = true
  and old.is_current is distinct from true
)
execute function public.notify_current_academic_term_change();


-- =====================================================
-- 9. NOTIFICAR CAMBIOS IMPORTANTES DE CUENTA
-- =====================================================

create function public.notify_profile_access_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if
    old.active is distinct from new.active
    and new.active = true
  then
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
      'account',
      'user',
      new.id,
      'Tu cuenta fue activada',
      'Tu acceso a UTCJ Sustentable se encuentra activo nuevamente.',
      '/',
      auth.uid()
    );

  elsif
    old.role is distinct from new.role
    and new.active = true
  then
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
      'account',
      'user',
      new.id,
      'Tus permisos fueron actualizados',
      case
        when new.role = 'admin'
          then 'Ahora tienes permisos de administrador en UTCJ Sustentable.'
        else
          'Tu cuenta ahora utiliza los permisos de usuario estándar.'
      end,
      '/',
      auth.uid()
    );
  end if;

  return new;
end;
$$;

revoke all
on function public.notify_profile_access_change()
from public;

create trigger notify_profile_access_change_trigger
after update of role, active
on public.profiles
for each row
execute function public.notify_profile_access_change();

commit;