import { supabase } from "@/lib/supabase";

import type {
  PersonalRecord,
} from "@/types/reportes";

function formatTerm(term: string): string {
  return term.replace("-", " - ");
}

// =====================================================
// OBTENER CAPITAL HUMANO
// =====================================================

async function fetchPersonal(): Promise<PersonalRecord[]> {
  const { data, error } = await supabase
    .from("human_capital")
    .select(`
      year,
      term,
      tm_tuesday,
      tv_thursday
    `)
    .order("year", {
      ascending: true,
    })
    .order("term", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data.map((record) => ({
    cuatrimestre:
      `${formatTerm(record.term)} ${record.year}`,

    tmMartes: record.tm_tuesday,
    tvJueves: record.tv_thursday,
  }));
}

// =====================================================
// PERSONAL POR CUATRIMESTRE
// =====================================================

export async function getPersonalPorCuatrimestre():
  Promise<PersonalRecord[]> {
  return fetchPersonal();
}

// =====================================================
// TOTALES POR TURNO
// =====================================================

export async function getPersonalTotales(): Promise<{
  tm: number;
  tv: number;
}> {
  const data = await fetchPersonal();

  return {
    tm: data.reduce(
      (sum, record) =>
        sum + record.tmMartes,
      0
    ),

    tv: data.reduce(
      (sum, record) =>
        sum + record.tvJueves,
      0
    ),
  };
}