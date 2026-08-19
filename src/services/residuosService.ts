import {
  getReportesData,
} from "@/services/reportsService";

import type {
  AñoTotal,
  MaterialTotal,
} from "@/types/reportes";

export async function getTotalHistorico():
  Promise<number> {
  const data =
    await getReportesData();

  return data.totalHistorico;
}

export async function getCo2Total():
  Promise<number> {
  const data =
    await getReportesData();

  return data.co2Total;
}

export async function getMaterialTotals():
  Promise<MaterialTotal[]> {
  const data =
    await getReportesData();

  return data.materialTotals;
}

export async function getAñoTotals():
  Promise<AñoTotal[]> {
  const data =
    await getReportesData();

  return data.añoTotals;
}

export async function getResiduosPorAño(
  año: number
): Promise<MaterialTotal[]> {
  const data =
    await getReportesData();

  return (
    data.residuosPorAño[año] ?? []
  );
}

export async function getCo2PorAño():
  Promise<AñoTotal[]> {
  const data =
    await getReportesData();

  return data.añoTotals;
}

export async function getAvailableYears():
  Promise<number[]> {
  const data =
    await getReportesData();

  return data.availableYears;
}