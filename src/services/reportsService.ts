import { supabase } from "@/lib/supabase";

import type {
  AñoTotal,
  MaterialTotal,
  PersonalRecord,
  ResiduoRecord,
} from "@/types/reportes";

interface ResiduoConFactor extends ResiduoRecord {
  co2Factor: number;
}

export interface ReportesData {
  totalHistorico: number;
  co2Total: number;
  materialTotals: MaterialTotal[];
  añoTotals: AñoTotal[];
  residuosPorAño: Record<number, MaterialTotal[]>;
  availableYears: number[];
  personalPorCuatrimestre: PersonalRecord[];
  personalTotales: {
    tm: number;
    tv: number;
  };
}

let reportesPromise: Promise<ReportesData> | null = null;

function formatTerm(term: string): string {
  return term.replace("-", " - ");
}

function buildMaterialTotals(
  records: ResiduoConFactor[]
): MaterialTotal[] {
  const materialMap = new Map<
    string,
    {
      totalKg: number;
      co2Evitado: number;
    }
  >();

  for (const record of records) {
    const current = materialMap.get(record.tipoResiduo) ?? {
      totalKg: 0,
      co2Evitado: 0,
    };

    current.totalKg += record.kilogramos;
    current.co2Evitado +=
      record.kilogramos * record.co2Factor;

    materialMap.set(record.tipoResiduo, current);
  }

  return Array.from(materialMap.entries())
    .map(([tipoResiduo, values]) => ({
      tipoResiduo,
      totalKg: values.totalKg,
      co2Evitado: values.co2Evitado,
    }))
    .sort((a, b) => b.totalKg - a.totalKg);
}

function buildAñoTotals(
  records: ResiduoConFactor[],
  totalHistorico: number
): AñoTotal[] {
  const yearMap = new Map<
    number,
    {
      totalKg: number;
      co2Evitado: number;
    }
  >();

  for (const record of records) {
    const current = yearMap.get(record.año) ?? {
      totalKg: 0,
      co2Evitado: 0,
    };

    current.totalKg += record.kilogramos;
    current.co2Evitado +=
      record.kilogramos * record.co2Factor;

    yearMap.set(record.año, current);
  }

  return Array.from(yearMap.entries())
    .map(([año, values]) => ({
      año,
      totalKg: values.totalKg,
      co2Evitado: values.co2Evitado,
      porcentaje:
        totalHistorico > 0
          ? (values.totalKg / totalHistorico) * 100
          : 0,
    }))
    .sort((a, b) => a.año - b.año);
}

function buildResiduosPorAño(
  records: ResiduoConFactor[],
  years: number[]
): Record<number, MaterialTotal[]> {
  const result: Record<number, MaterialTotal[]> = {};

  for (const year of years) {
    result[year] = buildMaterialTotals(
      records.filter((record) => record.año === year)
    ).sort((a, b) =>
      a.tipoResiduo.localeCompare(b.tipoResiduo, "es")
    );
  }

  return result;
}

async function fetchReportesData(): Promise<ReportesData> {
  const [residuosResult, personalResult] = await Promise.all([
    supabase
      .from("waste_collections")
      .select(`
        year,
        kilograms,
        co2_factor_applied,
        materials (
          name
        )
      `)
      .order("year", { ascending: true }),

    supabase
      .from("human_capital")
      .select(`
        year,
        term,
        tm_tuesday,
        tv_thursday
      `)
      .order("year", { ascending: true })
      .order("term", { ascending: true }),
  ]);

  if (residuosResult.error) {
    throw residuosResult.error;
  }

  if (personalResult.error) {
    throw personalResult.error;
  }

  const residuos: ResiduoConFactor[] = residuosResult.data.map(
    (record) => {
      if (!record.materials) {
        throw new Error(
          "Se encontró una recolección sin material relacionado."
        );
      }

      return {
        año: record.year,
        tipoResiduo: record.materials.name,
        kilogramos: Number(record.kilograms),
        co2Factor: Number(record.co2_factor_applied),
      };
    }
  );

  const personalPorCuatrimestre: PersonalRecord[] =
    personalResult.data.map((record) => ({
      cuatrimestre: `${formatTerm(record.term)} ${record.year}`,
      tmMartes: record.tm_tuesday,
      tvJueves: record.tv_thursday,
    }));

  const totalHistorico = residuos.reduce(
    (sum, record) => sum + record.kilogramos,
    0
  );

  const co2Total = residuos.reduce(
    (sum, record) =>
      sum + record.kilogramos * record.co2Factor,
    0
  );

  const materialTotals = buildMaterialTotals(residuos);

  const añoTotals = buildAñoTotals(
    residuos,
    totalHistorico
  );

  const availableYears = añoTotals.map(
    (item) => item.año
  );

  const personalTotales = personalPorCuatrimestre.reduce(
    (totals, record) => ({
      tm: totals.tm + record.tmMartes,
      tv: totals.tv + record.tvJueves,
    }),
    {
      tm: 0,
      tv: 0,
    }
  );

  return {
    totalHistorico,
    co2Total,
    materialTotals,
    añoTotals,
    residuosPorAño: buildResiduosPorAño(
      residuos,
      availableYears
    ),
    availableYears,
    personalPorCuatrimestre,
    personalTotales,
  };
}

export function getReportesData(): Promise<ReportesData> {
  if (!reportesPromise) {
    reportesPromise = fetchReportesData().catch(
      (error) => {
        reportesPromise = null;
        throw error;
      }
    );
  }

  return reportesPromise;
}

export function invalidateReportesCache(): void {
  reportesPromise = null;
}