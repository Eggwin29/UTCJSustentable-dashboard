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
  EstadiasPorCarrera,
} from "@/types/reportes";

interface EstadiasPorCarreraChartProps {
  data: EstadiasPorCarrera[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function EstadiasPorCarreraChart({
  data,
  isLoading,
  error,
}: EstadiasPorCarreraChartProps) {
  return (
    <ChartCard
      title="Participación por carrera"
      description="Total de participaciones de estadías por carrera."
      isLoading={isLoading}
      error={error}
    >
      <ResponsiveContainer
        width="100%"
        height={300}
        debounce={150}
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 10,
            right: 45,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            horizontal={false}
          />

          <XAxis
            type="number"
            allowDecimals={false}
            tick={{
              fontSize: 12,
              fill: "#64748b",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            type="category"
            dataKey="carrera"
            width={135}
            tick={{
              fontSize: 11,
              fill: "#64748b",
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            formatter={(value) => [
              typeof value === "number"
                ? value.toLocaleString(
                    "es-MX"
                  )
                : value ?? 0,
              "Participantes",
            ]}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          />

          <Bar
            dataKey="participantes"
            fill={CHART_COLORS.primary}
            radius={[0, 6, 6, 0]}
          >
            <LabelList
              dataKey="participantes"
              position="right"
              formatter={(value) =>
                typeof value === "number"
                  ? value.toLocaleString(
                      "es-MX"
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