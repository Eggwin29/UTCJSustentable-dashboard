import { supabase } from "@/lib/supabase";

import type {
  AcademicTermCode,
} from "@/types/academicTerm";

import type {
  AcademicLevel,
} from "@/types/internshipParticipation";

import type {
  AñoTotal,
  EstadiasPorCarrera,
  EstadiasPorCuatrimestre,
  EstadiasPorNivel,
  EstadiasTotales,
  MaterialTotal,
  PersonalRecord,
  ResiduoRecord,
} from "@/types/reportes";

interface ResiduoConFactor
  extends ResiduoRecord {
  co2Factor: number;
}

interface EstadiaReportRecord {
  year: number;
  term: AcademicTermCode;
  carrera: string;
  nivel: AcademicLevel;
  participantes: number;
}

export interface ReportesData {
  totalHistorico: number;
  co2Total: number;

  materialTotals: MaterialTotal[];
  añoTotals: AñoTotal[];

  residuosPorAño: Record<
    number,
    MaterialTotal[]
  >;

  availableYears: number[];

  personalPorCuatrimestre:
    PersonalRecord[];

  personalTotales: {
    tm: number;
    tv: number;
  };

  estadiasPorCarrera:
    EstadiasPorCarrera[];

  estadiasPorCuatrimestre:
    EstadiasPorCuatrimestre[];

  estadiasPorNivel:
    EstadiasPorNivel[];

  estadiasTotales:
    EstadiasTotales;
}

let reportesPromise:
  | Promise<ReportesData>
  | null = null;

function formatTerm(
  term: string
): string {
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
    const current =
      materialMap.get(
        record.tipoResiduo
      ) ?? {
        totalKg: 0,
        co2Evitado: 0,
      };

    current.totalKg +=
      record.kilogramos;

    current.co2Evitado +=
      record.kilogramos *
      record.co2Factor;

    materialMap.set(
      record.tipoResiduo,
      current
    );
  }

  return Array.from(
    materialMap.entries()
  )
    .map(
      ([tipoResiduo, values]) => ({
        tipoResiduo,
        totalKg: values.totalKg,

        co2Evitado:
          values.co2Evitado,
      })
    )
    .sort(
      (a, b) =>
        b.totalKg - a.totalKg
    );
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
    const current =
      yearMap.get(record.año) ?? {
        totalKg: 0,
        co2Evitado: 0,
      };

    current.totalKg +=
      record.kilogramos;

    current.co2Evitado +=
      record.kilogramos *
      record.co2Factor;

    yearMap.set(
      record.año,
      current
    );
  }

  return Array.from(
    yearMap.entries()
  )
    .map(([año, values]) => ({
      año,
      totalKg: values.totalKg,

      co2Evitado:
        values.co2Evitado,

      porcentaje:
        totalHistorico > 0
          ? (
              values.totalKg /
              totalHistorico
            ) * 100
          : 0,
    }))
    .sort(
      (a, b) => a.año - b.año
    );
}

function buildResiduosPorAño(
  records: ResiduoConFactor[],
  years: number[]
): Record<number, MaterialTotal[]> {
  const result: Record<
    number,
    MaterialTotal[]
  > = {};

  for (const year of years) {
    result[year] =
      buildMaterialTotals(
        records.filter(
          (record) =>
            record.año === year
        )
      ).sort((a, b) =>
        a.tipoResiduo.localeCompare(
          b.tipoResiduo,
          "es"
        )
      );
  }

  return result;
}

function buildEstadiasPorCarrera(
  records: EstadiaReportRecord[]
): EstadiasPorCarrera[] {
  const totals =
    new Map<string, number>();

  for (const record of records) {
    totals.set(
      record.carrera,

      (
        totals.get(
          record.carrera
        ) ?? 0
      ) + record.participantes
    );
  }

  return Array.from(
    totals.entries()
  )
    .map(
      ([carrera, participantes]) => ({
        carrera,
        participantes,
      })
    )
    .sort(
      (a, b) =>
        b.participantes -
          a.participantes ||
        a.carrera.localeCompare(
          b.carrera,
          "es"
        )
    );
}

function buildEstadiasPorNivel(
  records: EstadiaReportRecord[]
): EstadiasPorNivel[] {
  const totals = new Map<
    AcademicLevel,
    number
  >();

  for (const record of records) {
    totals.set(
      record.nivel,

      (
        totals.get(
          record.nivel
        ) ?? 0
      ) + record.participantes
    );
  }

  return Array.from(
    totals.entries()
  )
    .map(
      ([nivel, participantes]) => ({
        nivel,
        participantes,
      })
    )
    .sort(
      (a, b) =>
        b.participantes -
        a.participantes
    );
}

function buildEstadiasPorCuatrimestre(
  records: EstadiaReportRecord[]
): EstadiasPorCuatrimestre[] {
  const totals = new Map<
    string,
    {
      year: number;
      term: AcademicTermCode;
      participantes: number;
    }
  >();

  for (const record of records) {
    const key =
      `${record.year}-${record.term}`;

    const current =
      totals.get(key) ?? {
        year: record.year,
        term: record.term,
        participantes: 0,
      };

    current.participantes +=
      record.participantes;

    totals.set(
      key,
      current
    );
  }

  return Array.from(
    totals.values()
  )
    .sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }

      return (
        getTermOrder(a.term) -
        getTermOrder(b.term)
      );
    })
    .map((record) => ({
      cuatrimestre:
        `${formatTerm(
          record.term
        )} ${record.year}`,

      participantes:
        record.participantes,
    }));
}

function getTermOrder(
  term: unknown
): number {
  if (term === "E-A") {
    return 1;
  }

  if (term === "M-A") {
    return 2;
  }

  if (term === "S-D") {
    return 3;
  }

  return 0;
}

async function fetchReportesData():
  Promise<ReportesData> {
  const [
    residuosResult,
    personalResult,
    estadiasResult,
  ] = await Promise.all([
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
      .order(
        "year",
        {
          ascending: true,
        }
      ),

    supabase
      .from("human_capital")
      .select(`
        year,
        term,
        tm_tuesday,
        tv_thursday
      `)
      .order(
        "year",
        {
          ascending: true,
        }
      )
      .order(
        "term",
        {
          ascending: true,
        }
      ),

    supabase
      .from(
        "internship_participation"
      )
      .select(`
        participant_count,
        academic_level,
        academic_terms (
          year,
          term
        ),
        academic_programs (
          name
        )
      `),
  ]);

  if (residuosResult.error) {
    throw residuosResult.error;
  }

  if (personalResult.error) {
    throw personalResult.error;
  }

  if (estadiasResult.error) {
    throw estadiasResult.error;
  }

  const residuos:
    ResiduoConFactor[] =
      residuosResult.data.map(
        (record) => {
          if (!record.materials) {
            throw new Error(
              "Se encontró una recolección sin material relacionado."
            );
          }

          return {
            año:
              record.year,

            tipoResiduo:
              record.materials.name,

            kilogramos:
              Number(
                record.kilograms
              ),

            co2Factor:
              Number(
                record.co2_factor_applied
              ),
          };
        }
      );

  const personalPorCuatrimestre:
    PersonalRecord[] =
      personalResult.data.map(
        (record) => ({
          cuatrimestre:
            `${formatTerm(
              record.term
            )} ${record.year}`,

          tmMartes:
            record.tm_tuesday,

          tvJueves:
            record.tv_thursday,
        })
      );

  const estadias:
    EstadiaReportRecord[] =
      estadiasResult.data.map(
        (record) => {
          if (
            !record.academic_terms
          ) {
            throw new Error(
              "Se encontró una participación de estadías sin cuatrimestre relacionado."
            );
          }

          if (
            !record.academic_programs
          ) {
            throw new Error(
              "Se encontró una participación de estadías sin carrera relacionada."
            );
          }

          return {
            year:
              record
                .academic_terms
                .year,

            term:
              record
                .academic_terms
                .term,

            carrera:
              record
                .academic_programs
                .name,

            nivel:
              record
                .academic_level,

            participantes:
              record
                .participant_count,
          };
        }
      );

  const totalHistorico =
    residuos.reduce(
      (sum, record) =>
        sum +
        record.kilogramos,
      0
    );

  const co2Total =
    residuos.reduce(
      (sum, record) =>
        sum +
        record.kilogramos *
          record.co2Factor,
      0
    );

  const materialTotals =
    buildMaterialTotals(
      residuos
    );

  const añoTotals =
    buildAñoTotals(
      residuos,
      totalHistorico
    );

  const availableYears =
    añoTotals.map(
      (item) => item.año
    );

  const personalTotales =
    personalPorCuatrimestre.reduce(
      (totals, record) => ({
        tm:
          totals.tm +
          record.tmMartes,

        tv:
          totals.tv +
          record.tvJueves,
      }),
      {
        tm: 0,
        tv: 0,
      }
    );

  const estadiasTotales:
    EstadiasTotales = {
      registros:
        estadias.length,

      cuatrimestres:
        new Set(
          estadias.map(
            (record) =>
              `${record.year}-${record.term}`
          )
        ).size,

      carreras:
        new Set(
          estadias.map(
            (record) =>
              record.carrera
          )
        ).size,

      participantes:
        estadias.reduce(
          (total, record) =>
            total +
            record.participantes,
          0
        ),
    };

  return {
    totalHistorico,
    co2Total,
    materialTotals,
    añoTotals,

    residuosPorAño:
      buildResiduosPorAño(
        residuos,
        availableYears
      ),

    availableYears,

    personalPorCuatrimestre,
    personalTotales,

    estadiasPorCarrera:
      buildEstadiasPorCarrera(
        estadias
      ),

    estadiasPorCuatrimestre:
      buildEstadiasPorCuatrimestre(
        estadias
      ),

    estadiasPorNivel:
      buildEstadiasPorNivel(
        estadias
      ),

    estadiasTotales,
  };
}

export function getReportesData():
  Promise<ReportesData> {
  if (!reportesPromise) {
    reportesPromise =
      fetchReportesData().catch(
        (error) => {
          reportesPromise = null;
          throw error;
        }
      );
  }

  return reportesPromise;
}

export function invalidateReportesCache():
  void {
  reportesPromise = null;
}