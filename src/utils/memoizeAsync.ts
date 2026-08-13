// utils/memoizeAsync.ts
export function memoizeAsync<T>(fn: () => Promise<T>) {
  let cached: Promise<T> | null = null;

  return {
    run: () => {
      if (!cached) {
        cached = fn().catch((err) => {
          cached = null; // si falla, permite reintentar en la siguiente llamada
          throw err;
        });
      }
      return cached;
    },
    invalidate: () => {
      cached = null;
    },
  };
}