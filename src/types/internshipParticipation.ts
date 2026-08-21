import type {
  AcademicTermCode,
} from "@/types/academicTerm";

export type AcademicLevel =
  | "TSU"
  | "Licenciatura"
  | "Sin especificar";

export interface AcademicProgram {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicProgramInput {
  name: string;
}

export type UpdateAcademicProgramInput =
  CreateAcademicProgramInput;

export interface InternshipParticipationRecord {
  id: string;
  academicTermId: string;
  academicTermLabel: string;
  year: number;
  term: AcademicTermCode;
  academicProgramId: string;
  academicProgramName: string;
  academicLevel: AcademicLevel;
  participantCount: number;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInternshipParticipationInput {
  academicTermId: string;
  academicProgramId: string;
  academicLevel: AcademicLevel;
  participantCount: number;
  notes?: string | null;
}

export type UpdateInternshipParticipationInput =
  CreateInternshipParticipationInput;