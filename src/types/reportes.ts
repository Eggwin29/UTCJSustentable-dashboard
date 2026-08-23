import type {
  AcademicTermCode,
} from "@/types/academicTerm";

import type {
  AcademicLevel,
} from "@/types/internshipParticipation";

export type ReportPeriodMode =
  | "all"
  | "year"
  | "academic-term";

export type PersonalTurnFilter =
  | "all"
  | "tm"
  | "tv";

export type ReportSelectionMode =
  | "include"
  | "exclude";

export interface ReportSelection<
  T extends string | number,
> {
  mode: ReportSelectionMode;
  values: T[];
}

export const HISTORICAL_WITHOUT_TERM_ID =
  "__historical_without_academic_term__";

export interface ReportFilters {
  periodMode: ReportPeriodMode;

  years: ReportSelection<number>;

  academicTermIds:
    ReportSelection<string>;

  materials:
    ReportSelection<string>;

  personalTurn:
    PersonalTurnFilter;

  academicProgramIds:
    ReportSelection<string>;

  academicLevels:
    ReportSelection<AcademicLevel>;
}

export const DEFAULT_REPORT_FILTERS:
  ReportFilters = {
    periodMode: "all",

    years: {
      mode: "include",
      values: [],
    },

    academicTermIds: {
      mode: "include",
      values: [],
    },

    materials: {
      mode: "include",
      values: [],
    },

    personalTurn: "all",

    academicProgramIds: {
      mode: "include",
      values: [],
    },

    academicLevels: {
      mode: "include",
      values: [],
    },
  };

export function createDefaultReportFilters():
  ReportFilters {
  return {
    periodMode:
      DEFAULT_REPORT_FILTERS.periodMode,

    years: {
      mode: "include",
      values: [],
    },

    academicTermIds: {
      mode: "include",
      values: [],
    },

    materials: {
      mode: "include",
      values: [],
    },

    personalTurn:
      DEFAULT_REPORT_FILTERS.personalTurn,

    academicProgramIds: {
      mode: "include",
      values: [],
    },

    academicLevels: {
      mode: "include",
      values: [],
    },
  };
}

export interface ReportAcademicTermOption {
  id: string;
  label: string;
  year: number;
  term: AcademicTermCode;
}

export interface ReportAcademicProgramOption {
  id: string;
  name: string;
}

export interface ReportFilterOptions {
  years: number[];

  academicTerms:
    ReportAcademicTermOption[];

  hasHistoricalWithoutAcademicTerm:
    boolean;

  materials: string[];

  academicPrograms:
    ReportAcademicProgramOption[];

  academicLevels:
    AcademicLevel[];
}

export interface ResiduoRecord {
  año: number;
  tipoResiduo: string;
  kilogramos: number;
}

export interface PersonalRecord {
  cuatrimestre: string;
  tmMartes: number;
  tvJueves: number;
}

export interface MaterialTotal {
  tipoResiduo: string;
  totalKg: number;
  co2Evitado: number;
}

export interface AñoTotal {
  año: number;
  totalKg: number;
  co2Evitado: number;
  porcentaje: number;
}

export interface EstadiasPorCarrera {
  carrera: string;
  participantes: number;
}

export interface EstadiasPorCuatrimestre {
  cuatrimestre: string;
  participantes: number;
}

export interface EstadiasPorNivel {
  nivel: AcademicLevel;
  participantes: number;
}

export interface EstadiasTotales {
  registros: number;
  cuatrimestres: number;
  carreras: number;
  participantes: number;
}