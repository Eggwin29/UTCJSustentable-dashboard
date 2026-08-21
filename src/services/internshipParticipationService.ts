import { supabase } from "@/lib/supabase";

import {
  formatAcademicTerm,
} from "@/services/academicTermsService";

import {
  invalidateReportesCache,
} from "@/services/reportsService";

import type {
  AcademicTermCode,
} from "@/types/academicTerm";

import type {
  AcademicLevel,
  AcademicProgram,
  CreateInternshipParticipationInput,
  InternshipParticipationRecord,
  UpdateInternshipParticipationInput,
} from "@/types/internshipParticipation";

const ACADEMIC_PROGRAM_SELECT = `
  id,
  name,
  active,
  created_at,
  updated_at
` as const;

const INTERNSHIP_PARTICIPATION_SELECT = `
  id,
  academic_term_id,
  academic_program_id,
  academic_level,
  participant_count,
  notes,
  created_by,
  created_at,
  updated_at,
  academic_terms (
    year,
    term
  ),
  academic_programs (
    name
  )
` as const;

const ACADEMIC_LEVELS =
  new Set<AcademicLevel>([
    "TSU",
    "Licenciatura",
    "Sin especificar",
  ]);

interface AcademicProgramDatabaseRecord {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface InternshipParticipationDatabaseRecord {
  id: string;
  academic_term_id: string;
  academic_program_id: string;
  academic_level: AcademicLevel;
  participant_count: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;

  academic_terms: {
    year: number;
    term: AcademicTermCode;
  } | null;

  academic_programs: {
    name: string;
  } | null;
}

interface NormalizedInternshipParticipationInput {
  academicTermId: string;
  academicProgramId: string;
  academicLevel: AcademicLevel;
  participantCount: number;
  notes: string | null;
}

function mapAcademicProgram(
  record: AcademicProgramDatabaseRecord
): AcademicProgram {
  return {
    id: record.id,
    name: record.name,
    active: record.active,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapInternshipParticipation(
  record: InternshipParticipationDatabaseRecord
): InternshipParticipationRecord {
  if (!record.academic_terms) {
    throw new Error(
      "Se encontró una participación sin cuatrimestre relacionado."
    );
  }

  if (!record.academic_programs) {
    throw new Error(
      "Se encontró una participación sin carrera relacionada."
    );
  }

  return {
    id: record.id,

    academicTermId:
      record.academic_term_id,

    academicTermLabel:
      formatAcademicTerm(
        record.academic_terms.term,
        record.academic_terms.year
      ),

    year:
      record.academic_terms.year,

    term:
      record.academic_terms.term,

    academicProgramId:
      record.academic_program_id,

    academicProgramName:
      record.academic_programs.name,

    academicLevel:
      record.academic_level,

    participantCount:
      record.participant_count,

    notes:
      record.notes,

    createdBy:
      record.created_by,

    createdAt:
      record.created_at,

    updatedAt:
      record.updated_at,
  };
}

function normalizeInput(
  input:
    | CreateInternshipParticipationInput
    | UpdateInternshipParticipationInput
): NormalizedInternshipParticipationInput {
  const academicTermId =
    input.academicTermId.trim();

  const academicProgramId =
    input.academicProgramId.trim();

  const participantCount =
    Number(input.participantCount);

  const notes =
    input.notes?.trim() || null;

  if (!academicTermId) {
    throw new Error(
      "Selecciona un cuatrimestre."
    );
  }

  if (!academicProgramId) {
    throw new Error(
      "Selecciona una carrera."
    );
  }

  if (
    !ACADEMIC_LEVELS.has(
      input.academicLevel
    )
  ) {
    throw new Error(
      "Selecciona un nivel académico válido."
    );
  }

  if (
    !Number.isInteger(participantCount) ||
    participantCount < 1
  ) {
    throw new Error(
      "La cantidad de participantes debe ser un número entero mayor que cero."
    );
  }

  if (participantCount > 1000000) {
    throw new Error(
      "La cantidad de participantes supera el valor permitido."
    );
  }

  if (
    notes &&
    notes.length > 1000
  ) {
    throw new Error(
      "Las observaciones no pueden superar los 1000 caracteres."
    );
  }

  return {
    academicTermId,
    academicProgramId,

    academicLevel:
      input.academicLevel,

    participantCount,
    notes,
  };
}

function getTermOrder(
  term: unknown
): number {
  switch (term) {
    case "E-A":
      return 1;

    case "M-A":
      return 2;

    case "S-D":
      return 3;

    default:
      return 0;
  }
}

function compareInternshipParticipation(
  a: InternshipParticipationRecord,
  b: InternshipParticipationRecord
): number {
  if (a.year !== b.year) {
    return b.year - a.year;
  }

  if (a.term !== b.term) {
    return (
      getTermOrder(b.term) -
      getTermOrder(a.term)
    );
  }

  const programComparison =
    a.academicProgramName.localeCompare(
      b.academicProgramName,
      "es"
    );

  if (programComparison !== 0) {
    return programComparison;
  }

  return a.academicLevel.localeCompare(
    b.academicLevel,
    "es"
  );
}

function throwMutationError(
  error: {
    code?: string;
    message: string;
  }
): never {
  if (error.code === "23505") {
    throw new Error(
      "Ya existe un registro para ese cuatrimestre, carrera y nivel académico. Puedes editar el existente."
    );
  }

  throw error;
}

export const internshipParticipationService = {
  async getPrograms():
    Promise<AcademicProgram[]> {
    const { data, error } =
      await supabase
        .from("academic_programs")
        .select(
          ACADEMIC_PROGRAM_SELECT
        )
        .eq(
          "active",
          true
        )
        .order(
          "name",
          {
            ascending: true,
          }
        );

    if (error) {
      throw error;
    }

    return data.map((record) =>
      mapAcademicProgram(record)
    );
  },

  async getAll():
    Promise<InternshipParticipationRecord[]> {
    const { data, error } =
      await supabase
        .from(
          "internship_participation"
        )
        .select(
          INTERNSHIP_PARTICIPATION_SELECT
        );

    if (error) {
      throw error;
    }

    const records:
      InternshipParticipationRecord[] =
        data.map((record) =>
          mapInternshipParticipation(
            record
          )
        );

    return records.sort(
      compareInternshipParticipation
    );
  },

  async create(
    input: CreateInternshipParticipationInput
  ): Promise<InternshipParticipationRecord> {
    const normalized =
      normalizeInput(input);

    const { data, error } =
      await supabase
        .from(
          "internship_participation"
        )
        .insert({
          academic_term_id:
            normalized.academicTermId,

          academic_program_id:
            normalized.academicProgramId,

          academic_level:
            normalized.academicLevel,

          participant_count:
            normalized.participantCount,

          notes:
            normalized.notes,
        })
        .select(
          INTERNSHIP_PARTICIPATION_SELECT
        )
        .single();

    if (error) {
      throwMutationError(error);
    }

    invalidateReportesCache();

    return mapInternshipParticipation(
      data
    );
  },

  async update(
    participationId: string,
    input: UpdateInternshipParticipationInput
  ): Promise<InternshipParticipationRecord> {
    const normalized =
      normalizeInput(input);

    const { data, error } =
      await supabase
        .from(
          "internship_participation"
        )
        .update({
          academic_term_id:
            normalized.academicTermId,

          academic_program_id:
            normalized.academicProgramId,

          academic_level:
            normalized.academicLevel,

          participant_count:
            normalized.participantCount,

          notes:
            normalized.notes,
        })
        .eq(
          "id",
          participationId
        )
        .select(
          INTERNSHIP_PARTICIPATION_SELECT
        )
        .maybeSingle();

    if (error) {
      throwMutationError(error);
    }

    if (!data) {
      throw new Error(
        "El registro no existe o no tienes permiso para editarlo."
      );
    }

    invalidateReportesCache();

    return mapInternshipParticipation(
      data
    );
  },
};