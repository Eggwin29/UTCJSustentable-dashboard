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
  CreateHumanCapitalInput,
  HumanCapitalRecord,
  UpdateHumanCapitalInput,
} from "@/types/humanCapital";

const HUMAN_CAPITAL_SELECT = `
  id,
  academic_term_id,
  year,
  term,
  tm_tuesday,
  tv_thursday,
  notes,
  created_by,
  created_at,
  updated_at,
  academic_terms (
    year,
    term
  )
` as const;

interface HumanCapitalDatabaseRecord {
  id: string;
  academic_term_id: string;
  year: number;
  term: AcademicTermCode;
  tm_tuesday: number;
  tv_thursday: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;

  academic_terms: {
    year: number;
    term: AcademicTermCode;
  } | null;
}

interface NormalizedHumanCapitalInput {
  academicTermId: string;
  tmTuesday: number;
  tvThursday: number;
  notes: string | null;
}

function mapHumanCapitalRecord(
  record: HumanCapitalDatabaseRecord
): HumanCapitalRecord {
  const year =
    record.academic_terms?.year ??
    record.year;

  const term =
    record.academic_terms?.term ??
    record.term;

  return {
    id: record.id,

    academicTermId:
      record.academic_term_id,

    academicTermLabel:
      formatAcademicTerm(
        term,
        year
      ),

    year,
    term,

    tmTuesday:
      record.tm_tuesday,

    tvThursday:
      record.tv_thursday,

    totalParticipants:
      record.tm_tuesday +
      record.tv_thursday,

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
    | CreateHumanCapitalInput
    | UpdateHumanCapitalInput
): NormalizedHumanCapitalInput {
  const academicTermId =
    input.academicTermId.trim();

  const tmTuesday =
    Number(input.tmTuesday);

  const tvThursday =
    Number(input.tvThursday);

  const notes =
    input.notes?.trim() || null;

  if (!academicTermId) {
    throw new Error(
      "Selecciona un cuatrimestre."
    );
  }

  if (
    !Number.isInteger(tmTuesday) ||
    tmTuesday < 0
  ) {
    throw new Error(
      "La participación de T.M. Martes debe ser un número entero mayor o igual a cero."
    );
  }

  if (
    !Number.isInteger(tvThursday) ||
    tvThursday < 0
  ) {
    throw new Error(
      "La participación de T.V. Jueves debe ser un número entero mayor o igual a cero."
    );
  }

  if (
    tmTuesday > 1000000 ||
    tvThursday > 1000000
  ) {
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
    tmTuesday,
    tvThursday,
    notes,
  };
}

async function getAcademicTermValues(
  academicTermId: string
): Promise<{
  year: number;
  term: AcademicTermCode;
}> {
  const { data, error } =
    await supabase
      .from("academic_terms")
      .select("year, term")
      .eq("id", academicTermId)
      .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "El cuatrimestre seleccionado no existe."
    );
  }

  return data;
}

export const humanCapitalService = {
  async getAll():
    Promise<HumanCapitalRecord[]> {
    const { data, error } =
      await supabase
        .from("human_capital")
        .select(
          HUMAN_CAPITAL_SELECT
        )
        .order("year", {
          ascending: false,
        })
        .order("term", {
          ascending: false,
        });

    if (error) {
      throw error;
    }

    return data.map(
      mapHumanCapitalRecord
    );
  },

  async create(
    input: CreateHumanCapitalInput
  ): Promise<HumanCapitalRecord> {
    const normalized =
      normalizeInput(input);

    const academicTerm =
      await getAcademicTermValues(
        normalized.academicTermId
      );

    const { data, error } =
      await supabase
        .from("human_capital")
        .insert({
          academic_term_id:
            normalized.academicTermId,

          year:
            academicTerm.year,

          term:
            academicTerm.term,

          tm_tuesday:
            normalized.tmTuesday,

          tv_thursday:
            normalized.tvThursday,

          notes:
            normalized.notes,
        })
        .select(
          HUMAN_CAPITAL_SELECT
        )
        .single();

    if (error) {
      throw error;
    }

    invalidateReportesCache();

    return mapHumanCapitalRecord(
      data
    );
  },

  async update(
    humanCapitalId: string,
    input: UpdateHumanCapitalInput
  ): Promise<HumanCapitalRecord> {
    const normalized =
      normalizeInput(input);

    const { data, error } =
      await supabase
        .from("human_capital")
        .update({
          academic_term_id:
            normalized.academicTermId,

          tm_tuesday:
            normalized.tmTuesday,

          tv_thursday:
            normalized.tvThursday,

          notes:
            normalized.notes,
        })
        .eq(
          "id",
          humanCapitalId
        )
        .select(
          HUMAN_CAPITAL_SELECT
        )
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "El registro no existe o no tienes permiso para editarlo."
      );
    }

    invalidateReportesCache();

    return mapHumanCapitalRecord(
      data
    );
  },
};