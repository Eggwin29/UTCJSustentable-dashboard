import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "@/components/charts/ChartCard";
import { CHART_COLORS } from "@/config/reportesConfig";

import type {
  AñoTotal,
} from "@/types/reportes";

interface Co2PorAñoChartProps {
  data: AñoTotal[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function Co2PorAñoChart({
  data,
  isLoading,
  error,
}: Co2PorAñoChartProps) {
  return (
    <ChartCard
      title="CO₂ evitado por año"
      description="Impacto ambiental estimado dentro del resultado filtrado."
      isLoading={isLoading}
      error={error}
    >
      <ResponsiveContainer
        width="100%"
        height={280}
        debounce={150}
      >
        <BarChart
          data={data}
          margin={{
            top: 25,
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
            dataKey="año"
            tick={{
              fontSize: 12,
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
          />

          <Bar
            dataKey="co2Evitado"
            fill={
              CHART_COLORS.categorical[1]
            }
            radius={[6, 6, 0, 0]}
          >
            <LabelList
              dataKey="co2Evitado"
              position="top"
              formatter={(value) =>
                typeof value === "number"
                  ? value.toLocaleString(
                      "es-MX",
                      {
                        maximumFractionDigits: 2,
                      }
                    )
                  : ""
              }
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}