import { supabase } from "@/lib/supabase";

import type {
  AcademicTerm,
  AcademicTermCode,
  CreateAcademicTermInput,
  UpdateAcademicTermInput,
} from "@/types/academicTerm";

const ACADEMIC_TERM_SELECT = `
  id,
  year,
  term,
  start_date,
  end_date,
  is_current,
  created_at,
  updated_at
` as const;

interface AcademicTermRecord {
  id: string;
  year: number;
  term: AcademicTermCode;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

function mapAcademicTerm(
  record: AcademicTermRecord
): AcademicTerm {
  return {
    id: record.id,
    year: record.year,
    term: record.term,

    label: formatAcademicTerm(
      record.term,
      record.year
    ),

    startDate: record.start_date,
    endDate: record.end_date,
    isCurrent: record.is_current,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function normalizeInput(
  input:
    | CreateAcademicTermInput
    | UpdateAcademicTermInput
) {
  const year = Number(input.year);

  if (
    !Number.isInteger(year) ||
    year < 2022 ||
    year > 2100
  ) {
    throw new Error(
      "El año debe estar entre 2022 y 2100."
    );
  }

  if (
    !isDateString(input.startDate) ||
    !isDateString(input.endDate)
  ) {
    throw new Error(
      "Las fechas del cuatrimestre no son válidas."
    );
  }

  if (
    !input.startDate.startsWith(`${year}-`) ||
    !input.endDate.startsWith(`${year}-`)
  ) {
    throw new Error(
      "Las fechas deben pertenecer al año seleccionado."
    );
  }

  if (input.startDate > input.endDate) {
    throw new Error(
      "La fecha inicial no puede ser posterior a la fecha final."
    );
  }

  return {
    year,
    term: input.term,
    startDate: input.startDate,
    endDate: input.endDate,
  };
}

function isDateString(
  value: string
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00Z`
  );

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) ===
      value
  );
}

export function formatAcademicTerm(
  term: AcademicTermCode,
  year: number
): string {
  return `${term.replace("-", " - ")} ${year}`;
}

export function getDefaultAcademicTermDates(
  term: AcademicTermCode,
  year: number
) {
  if (term === "E-A") {
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-04-30`,
    };
  }

  if (term === "M-A") {
    return {
      startDate: `${year}-05-01`,
      endDate: `${year}-08-31`,
    };
  }

  return {
    startDate: `${year}-09-01`,
    endDate: `${year}-12-31`,
  };
}

export const academicTermsService = {
  async getAll():
    Promise<AcademicTerm[]> {
    const { data, error } =
      await supabase
        .from("academic_terms")
        .select(ACADEMIC_TERM_SELECT)
        .order("start_date", {
          ascending: false,
        });

    if (error) {
      throw error;
    }

    return data.map(mapAcademicTerm);
  },

  async getCurrent():
    Promise<AcademicTerm | null> {
    const { data, error } =
      await supabase
        .from("academic_terms")
        .select(ACADEMIC_TERM_SELECT)
        .eq("is_current", true)
        .maybeSingle();

    if (error) {
      throw error;
    }

    return data
      ? mapAcademicTerm(data)
      : null;
  },

  async create(
    input: CreateAcademicTermInput
  ): Promise<AcademicTerm> {
    const normalized =
      normalizeInput(input);

    const { data, error } =
      await supabase
        .from("academic_terms")
        .insert({
          year: normalized.year,
          term: normalized.term,

          start_date:
            normalized.startDate,

          end_date:
            normalized.endDate,
        })
        .select(ACADEMIC_TERM_SELECT)
        .single();

    if (error) {
      throw error;
    }

    return mapAcademicTerm(data);
  },

  async update(
    academicTermId: string,
    input: UpdateAcademicTermInput
  ): Promise<AcademicTerm> {
    const normalized =
      normalizeInput(input);

    const { data, error } =
      await supabase
        .from("academic_terms")
        .update({
          year: normalized.year,
          term: normalized.term,

          start_date:
            normalized.startDate,

          end_date:
            normalized.endDate,
        })
        .eq("id", academicTermId)
        .select(ACADEMIC_TERM_SELECT)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "El cuatrimestre no existe o no tienes permiso para editarlo."
      );
    }

    return mapAcademicTerm(data);
  },

  async setCurrent(
    academicTermId: string
  ): Promise<AcademicTerm> {
    const { error: rpcError } =
      await supabase.rpc(
        "set_current_academic_term",
        {
          target_id: academicTermId,
        }
      );

    if (rpcError) {
      throw rpcError;
    }

    const { data, error } =
      await supabase
        .from("academic_terms")
        .select(ACADEMIC_TERM_SELECT)
        .eq("id", academicTermId)
        .single();

    if (error) {
      throw error;
    }

    return mapAcademicTerm(data);
  },
};