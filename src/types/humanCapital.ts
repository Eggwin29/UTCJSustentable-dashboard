import type {
  AcademicTermCode,
} from "@/types/academicTerm";

export interface HumanCapitalRecord {
  id: string;
  academicTermId: string;
  academicTermLabel: string;
  year: number;
  term: AcademicTermCode;
  tmTuesday: number;
  tvThursday: number;
  totalParticipants: number;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHumanCapitalInput {
  academicTermId: string;
  tmTuesday: number;
  tvThursday: number;
  notes?: string | null;
}

export type UpdateHumanCapitalInput =
  CreateHumanCapitalInput;