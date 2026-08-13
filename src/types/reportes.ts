export interface ResiduoRecord {
  año: number;
  tipoResiduo: string;
  kilogramos: number;
}

export interface PersonalRecord {
  cuatrimestre: string; // ej. "S - D 2022"
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