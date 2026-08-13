import { residuosMock } from "@/data/mock/residuos.mock";
import { getCo2Factor } from "@/config/reportesConfig";
import type { ResiduoRecord, MaterialTotal, AñoTotal } from "@/types/reportes";
import { memoizeAsync } from "@/utils/memoizeAsync";


const residuosCache = memoizeAsync(async (): Promise<ResiduoRecord[]> => {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return residuosMock;
});

const SIMULATED_DELAY = 400;

// Punto único de reemplazo cuando exista la API real:
// export async function fetchResiduos(): Promise<ResiduoRecord[]> {
//   const res = await fetch("/api/residuos");
//   return res.json();
// }
async function fetchResiduos(): Promise<ResiduoRecord[]> {
  return residuosCache.run();
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return residuosMock;
}

export async function getTotalHistorico(): Promise<number> {
  const data = await fetchResiduos();
  return data.reduce((sum, r) => sum + r.kilogramos, 0);
}

export async function getCo2Total(): Promise<number> {
  const data = await fetchResiduos();
  return data.reduce((sum, r) => sum + r.kilogramos * getCo2Factor(r.tipoResiduo), 0);
}

export async function getMaterialTotals(): Promise<MaterialTotal[]> {
  const data = await fetchResiduos();
  const map = new Map<string, number>();
  for (const r of data) {
    map.set(r.tipoResiduo, (map.get(r.tipoResiduo) ?? 0) + r.kilogramos);
  }
  return Array.from(map.entries())
    .map(([tipoResiduo, totalKg]) => ({
      tipoResiduo,
      totalKg,
      co2Evitado: totalKg * getCo2Factor(tipoResiduo),
    }))
    .sort((a, b) => b.totalKg - a.totalKg);
}

export async function getAñoTotals(): Promise<AñoTotal[]> {
  const data = await fetchResiduos();
  const map = new Map<number, number>();
  for (const r of data) {
    map.set(r.año, (map.get(r.año) ?? 0) + r.kilogramos);
  }
  const totalGeneral = Array.from(map.values()).reduce((a, b) => a + b, 0);

  return Array.from(map.entries())
    .map(([año, totalKg]) => ({
      año,
      totalKg,
      co2Evitado: 0, // se calcula abajo por material real si se necesita desglose por año
      porcentaje: (totalKg / totalGeneral) * 100,
    }))
    .sort((a, b) => a.año - b.año);
}

export async function getResiduosPorAño(año: number): Promise<MaterialTotal[]> {
  const data = await fetchResiduos();
  return data
    .filter((r) => r.año === año)
    .map((r) => ({
      tipoResiduo: r.tipoResiduo,
      totalKg: r.kilogramos,
      co2Evitado: r.kilogramos * getCo2Factor(r.tipoResiduo),
    }));
}

export async function getCo2PorAño(): Promise<AñoTotal[]> {
  const data = await fetchResiduos();
  const kgMap = new Map<number, number>();
  const co2Map = new Map<number, number>();

  for (const r of data) {
    kgMap.set(r.año, (kgMap.get(r.año) ?? 0) + r.kilogramos);
    co2Map.set(r.año, (co2Map.get(r.año) ?? 0) + r.kilogramos * getCo2Factor(r.tipoResiduo));
  }

  const totalGeneral = Array.from(kgMap.values()).reduce((a, b) => a + b, 0);

  return Array.from(kgMap.entries())
    .map(([año, totalKg]) => ({
      año,
      totalKg,
      co2Evitado: co2Map.get(año) ?? 0,
      porcentaje: (totalKg / totalGeneral) * 100,
    }))
    .sort((a, b) => a.año - b.año);
}