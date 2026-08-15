-- =====================================================
-- UTCJ SUSTENTABLE
-- MATERIALES INICIALES
-- =====================================================

insert into public.materials (
  name,
  co2_factor,
  active
)
values
  ('Cartón', 0, true),
  ('Plástico', 0, true),
  ('Aluminio', 0, true),
  ('Papel', 0, true)
on conflict (name) do nothing;