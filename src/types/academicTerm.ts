export type AcademicTermCode =
  | "E-A"
  | "M-A"
  | "S-D";

export interface AcademicTerm {
  id: string;
  year: number;
  term: AcademicTermCode;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicTermInput {
  year: number;
  term: AcademicTermCode;
  startDate: string;
  endDate: string;
}

export type UpdateAcademicTermInput =
  CreateAcademicTermInput;