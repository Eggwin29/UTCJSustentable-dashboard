import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import ChartCard from "./ChartCard";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getAñoTotals } from "@/services/residuosService";
import { CHART_COLORS } from "@/config/reportesConfig";
import type { AñoTotal } from "@/types/reportes";

const DistribucionPorAñoChart: React.FC = () => {
  const { data, isLoading, error } = useAsyncData(getAñoTotals);

  const renderLabel = (entry: PieLabelRenderProps) => {
    const { totalKg, porcentaje } = entry as unknown as AñoTotal;
    const kgLabel = typeof totalKg === "number" ? totalKg.toLocaleString("es-MX") : "0";
    const pctLabel = typeof porcentaje === "number" ? `${porcentaje.toFixed(2)}%` : "";
    return `${kgLabel} (${pctLabel})`;
  };

  return (
    <ChartCard title="Distribución de Recolección por Año" isLoading={isLoading} error={error}>
      <ResponsiveContainer width="100%" height={280} debounce={150}>
        <PieChart>
          <Pie
            data={data ?? []}
            dataKey="totalKg"
            nameKey="año"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            label={renderLabel}
          >
            {(data ?? []).map((_, index) => (
              <Cell key={index} fill={CHART_COLORS.categorical[index % CHART_COLORS.categorical.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [
              typeof value === "number" ? `${value.toLocaleString("es-MX")} kg` : `${value ?? 0} kg`,
              "Total",
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default DistribucionPorAñoChart;