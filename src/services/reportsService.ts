import { supabase } from "@/lib/supabase";

import type {
  AcademicTermCode,
} from "@/types/academicTerm";

import type {
  AcademicLevel,
} from "@/types/internshipParticipation";

import {
  DEFAULT_REPORT_FILTERS,
  HISTORICAL_WITHOUT_TERM_ID,
} from "@/types/reportes";

import type {
  AñoTotal,
  EstadiasPorCarrera,
  EstadiasPorCuatrimestre,
  EstadiasPorNivel,
  EstadiasTotales,
  MaterialTotal,
  PersonalRecord,
  ReportAcademicTermOption,
  ReportFilterOptions,
  ReportFilters,
  ReportSelection,
  ResiduoRecord,
} from "@/types/reportes";

interface ResiduoReportRecord
  extends ResiduoRecord {
  academicTermId: string | null;
  academicTermYear: number | null;

  academicTermCode:
    | AcademicTermCode
    | null;

  co2Factor: number;
}

interface PersonalReportRecord {
  academicTermId: string;
  year: number;
  term: AcademicTermCode;
  tmMartes: number;
  tvJueves: number;
}

interface EstadiaReportRecord {
  academicTermId: string;
  academicProgramId: string;
  year: number;
  term: AcademicTermCode;
  carrera: string;
  nivel: AcademicLevel;
  participantes: number;
}

interface ReportesSourceData {
  residuos: ResiduoReportRecord[];
  personal: PersonalReportRecord[];
  estadias: EstadiaReportRecord[];
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

  estadiasTotales: EstadiasTotales;
}

let reportesSourcePromise:
  | Promise<ReportesSourceData>
  | null = null;

function formatTerm(
  term: string
): string {
  return term.replace("-", " - ");
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

function matchesSelection<
  T extends string | number,
>(
  value: T,
  selection: ReportSelection<T>
): boolean {
  if (
    selection.values.length === 0
  ) {
    return true;
  }

  const isSelected =
    selection.values.includes(value);

  return selection.mode === "include"
    ? isSelected
    : !isSelected;
}

function matchesPeriod(
  year: number,
  academicTermId: string | null,
  filters: ReportFilters
): boolean {
  if (
    filters.periodMode === "all"
  ) {
    return true;
  }

  if (
    filters.periodMode === "year"
  ) {
    return matchesSelection(
      year,
      filters.years
    );
  }

  return matchesSelection(
    academicTermId ??
      HISTORICAL_WITHOUT_TERM_ID,

    filters.academicTermIds
  );
}

function buildMaterialTotals(
  records: ResiduoReportRecord[]
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
  records: ResiduoReportRecord[],
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
          ? (values.totalKg /
              totalHistorico) *
            100
          : 0,
    }))
    .sort(
      (a, b) => a.año - b.año
    );
}

function buildResiduosPorAño(
  records: ResiduoReportRecord[],
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

      (totals.get(
        record.carrera
      ) ?? 0) +
        record.participantes
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

      (totals.get(record.nivel) ??
        0) + record.participantes
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

    totals.set(key, current);
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

function addAcademicTermOption(
  options: Map<
    string,
    ReportAcademicTermOption
  >,

  id: string | null,
  year: number | null,

  term:
    | AcademicTermCode
    | null
): void {
  if (
    !id ||
    year === null ||
    !term
  ) {
    return;
  }

  options.set(id, {
    id,
    year,
    term,

    label:
      `${formatTerm(term)} ${year}`,
  });
}

function buildFilterOptions(
  source: ReportesSourceData
): ReportFilterOptions {
  const years =
    new Set<number>();

  const academicTerms = new Map<
    string,
    ReportAcademicTermOption
  >();

  const materials =
    new Set<string>();

  const academicPrograms = new Map<
    string,
    string
  >();

  const academicLevels = new Set<
    AcademicLevel
  >();

  for (
    const record
    of source.residuos
  ) {
    years.add(record.año);

    materials.add(
      record.tipoResiduo
    );

    addAcademicTermOption(
      academicTerms,
      record.academicTermId,
      record.academicTermYear,
      record.academicTermCode
    );
  }

  for (
    const record
    of source.personal
  ) {
    years.add(record.year);

    addAcademicTermOption(
      academicTerms,
      record.academicTermId,
      record.year,
      record.term
    );
  }

  for (
    const record
    of source.estadias
  ) {
    years.add(record.year);

    addAcademicTermOption(
      academicTerms,
      record.academicTermId,
      record.year,
      record.term
    );

    academicPrograms.set(
      record.academicProgramId,
      record.carrera
    );

    academicLevels.add(
      record.nivel
    );
  }

  const levelOrder:
    AcademicLevel[] = [
      "TSU",
      "Licenciatura",
      "Sin especificar",
    ];

  return {
    years:
      Array.from(years).sort(
        (a, b) => b - a
      ),

    academicTerms:
      Array.from(
        academicTerms.values()
      ).sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }

        return (
          getTermOrder(b.term) -
          getTermOrder(a.term)
        );
      }),

    hasHistoricalWithoutAcademicTerm:
      source.residuos.some(
        (record) =>
          record.academicTermId ===
          null
      ),

    materials:
      Array.from(
        materials
      ).sort((a, b) =>
        a.localeCompare(b, "es")
      ),

    academicPrograms:
      Array.from(
        academicPrograms.entries()
      )
        .map(([id, name]) => ({
          id,
          name,
        }))
        .sort((a, b) =>
          a.name.localeCompare(
            b.name,
            "es"
          )
        ),

    academicLevels:
      levelOrder.filter(
        (level) =>
          academicLevels.has(level)
      ),
  };
}

function aggregateReportesData(
  source: ReportesSourceData,
  filters: ReportFilters
): ReportesData {
  const residuos =
    source.residuos.filter(
      (record) =>
        matchesPeriod(
          record.año,
          record.academicTermId,
          filters
        ) &&
        matchesSelection(
          record.tipoResiduo,
          filters.materials
        )
    );

  const personal =
    source.personal.filter(
      (record) =>
        matchesPeriod(
          record.year,
          record.academicTermId,
          filters
        )
    );

  const estadias =
    source.estadias.filter(
      (record) =>
        matchesPeriod(
          record.year,
          record.academicTermId,
          filters
        ) &&
        matchesSelection(
          record.academicProgramId,
          filters.academicProgramIds
        ) &&
        matchesSelection(
          record.nivel,
          filters.academicLevels
        )
    );

  const personalPorCuatrimestre:
    PersonalRecord[] =
      personal.map((record) => ({
        cuatrimestre:
          `${formatTerm(
            record.term
          )} ${record.year}`,

        tmMartes:
          filters.personalTurn ===
          "tv"
            ? 0
            : record.tmMartes,

        tvJueves:
          filters.personalTurn ===
          "tm"
            ? 0
            : record.tvJueves,
      }));

  const totalHistorico =
    residuos.reduce(
      (sum, record) =>
        sum + record.kilogramos,
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
    buildMaterialTotals(residuos);

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

async function fetchReportesSourceData():
  Promise<ReportesSourceData> {
  const [
    residuosResult,
    personalResult,
    estadiasResult,
  ] = await Promise.all([
    supabase
      .from(
        "waste_collections"
      )
      .select(`
        year,
        academic_term_id,
        kilograms,
        co2_factor_applied,
        academic_terms (
          year,
          term
        ),
        materials (
          name
        )
      `)
      .order("year", {
        ascending: true,
      }),

    supabase
      .from("human_capital")
      .select(`
        academic_term_id,
        year,
        term,
        tm_tuesday,
        tv_thursday
      `)
      .order("year", {
        ascending: true,
      })
      .order("term", {
        ascending: true,
      }),

    supabase
      .from(
        "internship_participation"
      )
      .select(`
        academic_term_id,
        academic_program_id,
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
    ResiduoReportRecord[] =
      residuosResult.data.map(
        (record) => {
          if (!record.materials) {
            throw new Error(
              "Se encontró una recolección sin material relacionado."
            );
          }

          return {
            año: record.year,

            academicTermId:
              record
                .academic_term_id,

            academicTermYear:
              record.academic_terms
                ?.year ?? null,

            academicTermCode:
              record.academic_terms
                ?.term ?? null,

            tipoResiduo:
              record.materials.name,

            kilogramos:
              Number(
                record.kilograms
              ),

            co2Factor:
              Number(
                record
                  .co2_factor_applied
              ),
          };
        }
      );

  const personal:
    PersonalReportRecord[] =
      personalResult.data.map(
        (record) => ({
          academicTermId:
            record.academic_term_id,

          year: record.year,
          term: record.term,

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
            academicTermId:
              record
                .academic_term_id,

            academicProgramId:
              record
                .academic_program_id,

            year:
              record
                .academic_terms.year,

            term:
              record
                .academic_terms.term,

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

  return {
    residuos,
    personal,
    estadias,
  };
}

function getReportesSourceData():
  Promise<ReportesSourceData> {
  if (!reportesSourcePromise) {
    reportesSourcePromise =
      fetchReportesSourceData().catch(
        (error) => {
          reportesSourcePromise = null;

          throw error;
        }
      );
  }

  return reportesSourcePromise;
}

export async function getReportesData(
  filters: ReportFilters =
    DEFAULT_REPORT_FILTERS
): Promise<ReportesData> {
  const source =
    await getReportesSourceData();

  return aggregateReportesData(
    source,
    filters
  );
}

export async function getReportFilterOptions():
  Promise<ReportFilterOptions> {
  const source =
    await getReportesSourceData();

  return buildFilterOptions(source);
}

export function invalidateReportesCache():
  void {
  reportesSourcePromise = null;
}