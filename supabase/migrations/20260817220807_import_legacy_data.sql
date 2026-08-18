-- =====================================================
-- UTCJ SUSTENTABLE
-- IMPORTACIÓN DE DATOS HISTÓRICOS
--
-- Fuente:
-- Concentrado General 2025 normalizado.xlsx
-- =====================================================


-- =====================================================
-- 1. RESIDUOS HISTÓRICOS
-- =====================================================
--
-- El Excel original almacena información agregada
-- por año + tipo de residuo.
--
-- No se inventan fechas específicas.
-- collection_date = null
-- created_by      = null
-- record_type     = historical
-- =====================================================

with legacy_residues (
  year,
  material_name,
  kilograms
) as (

  values

    -- =============================================
    -- 2022
    -- =============================================
    (2022::smallint, 'Plástico',    728.00::numeric),
    (2022::smallint, 'Aluminio',     15.00::numeric),
    (2022::smallint, 'Papel',       822.00::numeric),
    (2022::smallint, 'Cartón',      804.50::numeric),

    -- =============================================
    -- 2023
    -- =============================================
    (2023::smallint, 'Plástico',   1218.00::numeric),
    (2023::smallint, 'Aluminio',     59.00::numeric),
    (2023::smallint, 'Papel',       703.00::numeric),
    (2023::smallint, 'Cartón',     1265.00::numeric),

    -- =============================================
    -- 2024
    -- =============================================
    (2024::smallint, 'Plástico',   1146.00::numeric),
    (2024::smallint, 'Aluminio',    160.50::numeric),
    (2024::smallint, 'Papel',      1070.00::numeric),
    (2024::smallint, 'Cartón',     2523.50::numeric),
    (2024::smallint, 'Electrónica', 146.00::numeric),

    -- =============================================
    -- 2025
    -- =============================================
    (2025::smallint, 'Plástico',    340.00::numeric),
    (2025::smallint, 'Aluminio',    168.20::numeric),
    (2025::smallint, 'Cartón',      256.00::numeric),
    (2025::smallint, 'Pilas',        98.15::numeric),

    -- =============================================
    -- 2026
    -- =============================================
    -- En Excel aparece "Cartón " con un espacio final.
    -- Se normaliza únicamente el nombre.
    (2026::smallint, 'Cartón',      197.00::numeric),
    (2026::smallint, 'Plástico',     75.00::numeric),
    (2026::smallint, 'Pilas',        20.00::numeric)

)

insert into public.waste_collections (
  year,
  collection_date,
  material_id,
  kilograms,
  location,
  notes,
  created_by,
  record_type
)

select
  legacy.year,
  null,
  material.id,
  legacy.kilograms,
  null,
  null,
  null,
  'historical'::public.waste_record_type

from legacy_residues legacy

join public.materials material
  on material.name = legacy.material_name

-- Permite que la migración sea segura ante duplicados
-- del histórico año + material.
on conflict (year, material_id)
where record_type = 'historical'

do update set
  kilograms = excluded.kilograms;



-- =====================================================
-- 2. CAPITAL HUMANO HISTÓRICO
-- =====================================================
--
-- Excel:
--
-- Cuatrimestre
-- T.M. Martes
-- T.V. Jueves
--
-- Separamos:
--
-- "S - D 2022"
--
-- en:
--
-- year = 2022
-- term = S-D
-- =====================================================

insert into public.human_capital (
  year,
  term,
  tm_tuesday,
  tv_thursday
)

values

  -- 2022
  (2022, 'S-D', 110, 47),

  -- 2023
  (2023, 'E-A', 33, 26),
  (2023, 'M-A', 15,  7),
  (2023, 'S-D', 53, 35),

  -- 2024
  (2024, 'E-A', 12, 22),
  (2024, 'M-A',  6, 16),
  (2024, 'S-D', 41, 48),

  -- 2025
  (2025, 'E-A', 20, 10),
  (2025, 'M-A', 12, 20),
  (2025, 'S-D', 50, 55)

on conflict (year, term)

do update set
  tm_tuesday = excluded.tm_tuesday,
  tv_thursday = excluded.tv_thursday;



-- =====================================================
-- 3. VALIDACIÓN AUTOMÁTICA
-- =====================================================
--
-- Si algún dato no coincide con el Excel / Power BI,
-- la migración falla y NO queda aplicada.
-- =====================================================

do $$

declare

  historical_rows integer;
  total_kilograms numeric;
  total_co2 numeric;

  human_rows integer;
  total_tm integer;
  total_tv integer;

begin

  -- ===================================================
  -- VALIDAR RESIDUOS
  -- ===================================================

  select
    count(*),
    coalesce(sum(w.kilograms), 0),
    round(
      coalesce(
        sum(w.kilograms * m.co2_factor),
        0
      ),
      2
    )

  into
    historical_rows,
    total_kilograms,
    total_co2

  from public.waste_collections w

  join public.materials m
    on m.id = w.material_id

  where w.record_type = 'historical';


  if historical_rows <> 20 then
    raise exception
      'Validación histórica fallida: se esperaban 20 registros y existen %',
      historical_rows;
  end if;


  if total_kilograms <> 11814.85 then
    raise exception
      'Validación de kilogramos fallida: esperado 11814.85, obtenido %',
      total_kilograms;
  end if;


  if total_co2 <> 16163.05 then
    raise exception
      'Validación de CO2 fallida: esperado 16163.05, obtenido %',
      total_co2;
  end if;



  -- ===================================================
  -- VALIDAR CAPITAL HUMANO
  -- ===================================================

  select
    count(*),
    coalesce(sum(tm_tuesday), 0),
    coalesce(sum(tv_thursday), 0)

  into
    human_rows,
    total_tm,
    total_tv

  from public.human_capital;


  if human_rows <> 10 then
    raise exception
      'Validación de capital humano fallida: se esperaban 10 registros y existen %',
      human_rows;
  end if;


  if total_tm <> 352 then
    raise exception
      'Validación T.M. fallida: esperado 352, obtenido %',
      total_tm;
  end if;


  if total_tv <> 286 then
    raise exception
      'Validación T.V. fallida: esperado 286, obtenido %',
      total_tv;
  end if;


end $$;