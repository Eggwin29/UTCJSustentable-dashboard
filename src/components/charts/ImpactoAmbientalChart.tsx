import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "@/components/charts/ChartCard";
import { CHART_COLORS } from "@/config/reportesConfig";

import type {
  MaterialTotal,
} from "@/types/reportes";

interface ImpactoAmbientalChartProps {
  data: MaterialTotal[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function ImpactoAmbientalChart({
  data,
  isLoading,
  error,
}: ImpactoAmbientalChartProps) {
  const sorted = [...data].sort(
    (a, b) =>
      b.co2Evitado - a.co2Evitado
  );

  return (
    <ChartCard
      title="Impacto ambiental por material"
      description="CO₂ evitado estimado por tipo de material."
      isLoading={isLoading}
      error={error}
    >
      <ResponsiveContainer
        width="100%"
        height={260}
        debounce={150}
      >
        <BarChart
          data={sorted}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />

          <XAxis
            dataKey="tipoResiduo"
            tick={{
              fontSize: 11,
              fill: "#64748b",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fontSize: 12,
              fill: "#64748b",
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            formatter={(value) => [
              typeof value === "number"
                ? `${value.toLocaleString(
                    "es-MX",
                    {
                      maximumFractionDigits: 2,
                    }
                  )} kg`
                : `${value ?? 0} kg`,
              "CO₂ evitado",
            ]}
            contentStyle={{
              borderRadius: 8,
            }}
          />

          <Bar
            dataKey="co2Evitado"
            fill={
              CHART_COLORS.categorical[2]
            }
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}