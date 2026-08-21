import { supabase } from "@/lib/supabase";

import {
  invalidateReportesCache,
} from "@/services/reportsService";

import type {
  AcademicProgram,
  CreateAcademicProgramInput,
  UpdateAcademicProgramInput,
} from "@/types/internshipParticipation";

const ACADEMIC_PROGRAM_SELECT = `
  id,
  name,
  active,
  created_at,
  updated_at
` as const;

interface AcademicProgramDatabaseRecord {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
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

function normalizeName(
  name: string
): string {
  const normalizedName = name
    .trim()
    .replace(/\s+/g, " ");

  if (!normalizedName) {
    throw new Error(
      "Escribe el nombre de la carrera."
    );
  }

  if (normalizedName.length > 120) {
    throw new Error(
      "El nombre de la carrera no puede superar los 120 caracteres."
    );
  }

  return normalizedName;
}

function throwMutationError(
  error: {
    code?: string;
    message: string;
  }
): never {
  if (error.code === "23505") {
    throw new Error(
      "Ya existe una carrera con ese nombre."
    );
  }

  throw error;
}

export const academicProgramsService = {
  async getAll(): Promise<
    AcademicProgram[]
  > {
    const { data, error } =
      await supabase
        .from("academic_programs")
        .select(
          ACADEMIC_PROGRAM_SELECT
        )
        .order("name", {
          ascending: true,
        });

    if (error) {
      throw error;
    }

    return data.map(
      mapAcademicProgram
    );
  },

  async create(
    input: CreateAcademicProgramInput
  ): Promise<AcademicProgram> {
    const name =
      normalizeName(input.name);

    const { data, error } =
      await supabase
        .from("academic_programs")
        .insert({
          name,
        })
        .select(
          ACADEMIC_PROGRAM_SELECT
        )
        .single();

    if (error) {
      throwMutationError(error);
    }

    invalidateReportesCache();

    return mapAcademicProgram(data);
  },

  async update(
    academicProgramId: string,
    input: UpdateAcademicProgramInput
  ): Promise<AcademicProgram> {
    const name =
      normalizeName(input.name);

    const { data, error } =
      await supabase
        .from("academic_programs")
        .update({
          name,
        })
        .eq(
          "id",
          academicProgramId
        )
        .select(
          ACADEMIC_PROGRAM_SELECT
        )
        .maybeSingle();

    if (error) {
      throwMutationError(error);
    }

    if (!data) {
      throw new Error(
        "La carrera no existe o no tienes permiso para editarla."
      );
    }

    invalidateReportesCache();

    return mapAcademicProgram(data);
  },

  async setActive(
    academicProgramId: string,
    active: boolean
  ): Promise<AcademicProgram> {
    const { data, error } =
      await supabase
        .from("academic_programs")
        .update({
          active,
        })
        .eq(
          "id",
          academicProgramId
        )
        .select(
          ACADEMIC_PROGRAM_SELECT
        )
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "La carrera no existe o no tienes permiso para modificarla."
      );
    }

    invalidateReportesCache();

    return mapAcademicProgram(data);
  },
};