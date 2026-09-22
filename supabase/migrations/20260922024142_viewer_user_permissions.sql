-- =====================================================
-- UTCJ SUSTENTABLE
-- USUARIOS DE CONSULTA Y ESCRITURA EXCLUSIVA DE ADMIN
-- =====================================================

begin;

-- Los usuarios comunes pueden consultar las recolecciones,
-- pero únicamente un administrador puede crearlas.

drop policy if exists
"Users can create collections"
on public.waste_collections;

drop policy if exists
"Active users can create collections"
on public.waste_collections;

drop policy if exists
"Admins can create collections"
on public.waste_collections;

create policy "Admins can create collections"
on public.waste_collections
for insert
to authenticated
with check (
  public.is_admin()
  and record_type = 'collection'
  and created_by = (select auth.uid())
  and collection_date is not null
  and year =
    extract(year from collection_date)::smallint
);


-- Únicamente los administradores pueden modificar
-- las recolecciones existentes.

drop policy if exists
"Users can update own collections"
on public.waste_collections;

drop policy if exists
"Active users can update own collections"
on public.waste_collections;

drop policy if exists
"Admins can update collections"
on public.waste_collections;

create policy "Admins can update collections"
on public.waste_collections
for update
to authenticated
using (
  public.is_admin()
  and record_type = 'collection'
)
with check (
  public.is_admin()
  and record_type = 'collection'
  and created_by is not null
  and collection_date is not null
  and year =
    extract(year from collection_date)::smallint
);


-- Únicamente los administradores pueden eliminar
-- recolecciones.

drop policy if exists
"Users can delete own collections"
on public.waste_collections;

drop policy if exists
"Active users can delete own collections"
on public.waste_collections;

drop policy if exists
"Admins can delete collections"
on public.waste_collections;

create policy "Admins can delete collections"
on public.waste_collections
for delete
to authenticated
using (
  public.is_admin()
  and record_type = 'collection'
);

commit;