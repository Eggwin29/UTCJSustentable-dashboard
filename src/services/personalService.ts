import { getReportesData } from "@/services/reportsService";

import type { PersonalRecord } from "@/types/reportes";

export async function getPersonalPorCuatrimestre(): Promise<
  PersonalRecord[]
> {
  const data = await getReportesData();

  return data.personalPorCuatrimestre;
}

export async function getPersonalTotales(): Promise<{
  tm: number;
  tv: number;
}> {
  const data = await getReportesData();

  return data.personalTotales;
}