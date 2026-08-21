import type {
  AcademicLevel,
} from "@/types/internshipParticipation";

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