import { personalMock } from "@/data/mock/personal.mock";
import type { PersonalRecord } from "@/types/reportes";
import { memoizeAsync } from "@/utils/memoizeAsync";

const personalCache = memoizeAsync(async (): Promise<PersonalRecord[]> => {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return personalMock;
});

const SIMULATED_DELAY = 400;

async function fetchPersonal(): Promise<PersonalRecord[]> {
  return personalCache.run();
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return personalMock;
}

export async function getPersonalPorCuatrimestre(): Promise<PersonalRecord[]> {
  return fetchPersonal();
}

export async function getPersonalTotales(): Promise<{ tm: number; tv: number }> {
  const data = await fetchPersonal();
  return {
    tm: data.reduce((sum, r) => sum + r.tmMartes, 0),
    tv: data.reduce((sum, r) => sum + r.tvJueves, 0),
  };
}