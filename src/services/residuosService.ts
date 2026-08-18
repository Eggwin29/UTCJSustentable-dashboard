import { supabase } from "@/lib/supabase";

import type {
  ResiduoRecord,
  MaterialTotal,
  AñoTotal,
} from "@/types/reportes";

interface ResiduoConFactor extends ResiduoRecord {
  co2Factor: number;
}

// =====================================================
// OBTENER DATOS BASE DESDE SUPABASE
// =====================================================

async function fetchResiduos(): Promise<ResiduoConFactor[]> {
  const { data, error } = await supabase
    .from("waste_collections")
    .select(`
      year,
      kilograms,
      materials (
        name,
        co2_factor
      )
    `)
    .order("year", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data.map((record) => {
    if (!record.materials) {
      throw new Error(
        "Se encontró una recolección sin material relacionado."
      );
    }

    return {
      año: record.year,
      tipoResiduo: record.materials.name,
      kilogramos: Number(record.kilograms),
      co2Factor: Number(record.materials.co2_factor),
    };
  });
}

// =====================================================
// TOTAL RECOLECTADO
// =====================================================

export async function getTotalHistorico(): Promise<number> {
  const data = await fetchResiduos();

  return data.reduce(
    (sum, record) => sum + record.kilogramos,
    0
  );
}

// =====================================================
// CO2 TOTAL
// =====================================================

export async function getCo2Total(): Promise<number> {
  const data = await fetchResiduos();

  return data.reduce(
    (sum, record) =>
      sum + record.kilogramos * record.co2Factor,
    0
  );
}

// =====================================================
// TOTALES POR MATERIAL
// =====================================================

export async function getMaterialTotals(): Promise<MaterialTotal[]> {
  const data = await fetchResiduos();

  const materialMap = new Map<
    string,
    {
      totalKg: number;
      co2Evitado: number;
    }
  >();

  for (const record of data) {
    const current = materialMap.get(record.tipoResiduo) ?? {
      totalKg: 0,
      co2Evitado: 0,
    };

    current.totalKg += record.kilogramos;

    current.co2Evitado +=
      record.kilogramos * record.co2Factor;

    materialMap.set(
      record.tipoResiduo,
      current
    );
  }

  return Array.from(materialMap.entries())
    .map(([tipoResiduo, values]) => ({
      tipoResiduo,
      totalKg: values.totalKg,
      co2Evitado: values.co2Evitado,
    }))
    .sort((a, b) => b.totalKg - a.totalKg);
}

// =====================================================
// TOTALES POR AÑO
// =====================================================

export async function getAñoTotals(): Promise<AñoTotal[]> {
  const data = await fetchResiduos();

  const yearMap = new Map<
    number,
    {
      totalKg: number;
      co2Evitado: number;
    }
  >();

  for (const record of data) {
    const current = yearMap.get(record.año) ?? {
      totalKg: 0,
      co2Evitado: 0,
    };

    current.totalKg += record.kilogramos;

    current.co2Evitado +=
      record.kilogramos * record.co2Factor;

    yearMap.set(record.año, current);
  }

  const totalGeneral = Array.from(
    yearMap.values()
  ).reduce(
    (sum, year) => sum + year.totalKg,
    0
  );

  return Array.from(yearMap.entries())
    .map(([año, values]) => ({
      año,
      totalKg: values.totalKg,
      co2Evitado: values.co2Evitado,
      porcentaje:
        totalGeneral > 0
          ? (values.totalKg / totalGeneral) * 100
          : 0,
    }))
    .sort((a, b) => a.año - b.año);
}

// =====================================================
// MATERIALES POR AÑO
// =====================================================

export async function getResiduosPorAño(
  año: number
): Promise<MaterialTotal[]> {
  const data = await fetchResiduos();

  const materialMap = new Map<
    string,
    {
      totalKg: number;
      co2Evitado: number;
    }
  >();

  for (const record of data) {
    if (record.año !== año) {
      continue;
    }

    const current = materialMap.get(record.tipoResiduo) ?? {
      totalKg: 0,
      co2Evitado: 0,
    };

    current.totalKg += record.kilogramos;

    current.co2Evitado +=
      record.kilogramos * record.co2Factor;

    materialMap.set(
      record.tipoResiduo,
      current
    );
  }

  return Array.from(materialMap.entries())
    .map(([tipoResiduo, values]) => ({
      tipoResiduo,
      totalKg: values.totalKg,
      co2Evitado: values.co2Evitado,
    }))
    .sort((a, b) =>
      a.tipoResiduo.localeCompare(
        b.tipoResiduo,
        "es"
      )
    );
}

// =====================================================
// CO2 POR AÑO
// =====================================================

export async function getCo2PorAño(): Promise<AñoTotal[]> {
  return getAñoTotals();
}

// =====================================================
// AÑOS DISPONIBLES
// =====================================================

export async function getAvailableYears(): Promise<number[]> {
  const data = await fetchResiduos();

  return Array.from(
    new Set(
      data.map((record) => record.año)
    )
  ).sort((a, b) => a - b);
}