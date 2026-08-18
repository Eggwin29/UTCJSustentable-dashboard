import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import ChartCard from "./ChartCard";

import { useAsyncData } from "@/hooks/useAsyncData";
import { getCo2PorAño } from "@/services/residuosService";

import { CHART_COLORS } from "@/config/reportesConfig";

export default function Co2PorAñoChart() {
  const {
    data,
    isLoading,
    error,
  } = useAsyncData(getCo2PorAño);

  return (
    <ChartCard
      title="CO₂ Evitado por Año"
      description="Impacto ambiental estimado por año."
      isLoading={isLoading}
      error={error}
    >
      <ResponsiveContainer
        width="100%"
        height={280}
        debounce={150}
      >
        <BarChart
          data={data ?? []}
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
                ? `${value.toLocaleString("es-MX", {
                    maximumFractionDigits: 2,
                  })} kg`
                : `${value ?? 0} kg`,

              "CO₂ evitado",
            ]}
          />

          <Bar
            dataKey="co2Evitado"
            fill={CHART_COLORS.categorical[1]}
            radius={[6, 6, 0, 0]}
          >
            <LabelList
              dataKey="co2Evitado"
              position="top"
              formatter={(value) =>
                typeof value === "number"
                  ? value.toLocaleString("es-MX", {
                      maximumFractionDigits: 2,
                    })
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