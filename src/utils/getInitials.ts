// utils/getInitials.ts

/**
 * Toma un nombre completo y devuelve hasta 2 iniciales en mayuscula.
 * Ej: "Edwin Martinez" -> "EM"
 */
export const getInitials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");