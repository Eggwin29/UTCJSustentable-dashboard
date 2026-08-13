// ⚠️ Factores INFERIDOS a partir de la captura de PowerBI, pendientes de confirmar.
// Cartón, Plástico, Electrónica y Pilas cuadran exacto contra la imagen.
// Papel y Aluminio son un estimado razonable — ACTUALIZAR cuando se confirme la medida DAX real.
export const CO2_FACTORS: Record<string, number> = {
  "Cartón": 0.8,
  "Plástico": 1.5,
  "Papel": 1.4, // pendiente de confirmar
  "Aluminio": 8.0, // pendiente de confirmar
  "Electrónica": 2.0,
  "Pilas": 3.0,
};

export function getCo2Factor(tipoResiduo: string): number {
  return CO2_FACTORS[tipoResiduo] ?? 0;
}

// Paleta compartida — mismo lenguaje visual que Badge/Toast (emerald/slate + acentos)
export const CHART_COLORS = {
  primary: "#059669", // emerald-600
  categorical: ["#059669", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"],
  tm: "#0ea5e9", // blue
  tv: "#64748b", // slate
};