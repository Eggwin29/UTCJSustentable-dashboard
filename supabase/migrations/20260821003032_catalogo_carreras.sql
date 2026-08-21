begin;

-- =====================================================
-- PERMISOS DEL CATÁLOGO DE CARRERAS
-- =====================================================

grant select, insert, update
on public.academic_programs
to authenticated;


-- =====================================================
-- ELIMINAR POLÍTICAS ANTERIORES SI EXISTEN
-- =====================================================

drop policy if exists
"Admins can insert academic programs"
on public.academic_programs;

drop policy if exists
"Admins can update academic programs"
on public.academic_programs;


-- =====================================================
-- SOLO ADMINISTRADORES PUEDEN CREAR CARRERAS
-- =====================================================

create policy
"Admins can insert academic programs"
on public.academic_programs
for insert
to authenticated
with check (
  public.is_admin()
);


-- =====================================================
-- SOLO ADMINISTRADORES PUEDEN EDITAR CARRERAS
-- =====================================================

create policy
"Admins can update academic programs"
on public.academic_programs
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

commit;