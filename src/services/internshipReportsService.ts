import {
  getReportesData,
} from "@/services/reportsService";

import type {
  EstadiasPorCarrera,
  EstadiasPorCuatrimestre,
  EstadiasPorNivel,
  EstadiasTotales,
} from "@/types/reportes";

export async function getEstadiasPorCarrera():
  Promise<EstadiasPorCarrera[]> {
  const data =
    await getReportesData();

  return data.estadiasPorCarrera;
}

export async function getEstadiasPorCuatrimestre():
  Promise<EstadiasPorCuatrimestre[]> {
  const data =
    await getReportesData();

  return data.estadiasPorCuatrimestre;
}

export async function getEstadiasPorNivel():
  Promise<EstadiasPorNivel[]> {
  const data =
    await getReportesData();

  return data.estadiasPorNivel;
}

export async function getEstadiasTotales():
  Promise<EstadiasTotales> {
  const data =
    await getReportesData();

  return data.estadiasTotales;
}