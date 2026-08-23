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
  MaterialTotal,
} from "@/types/reportes";

interface MaterialesRecicladosChartProps {
  data: MaterialTotal[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function MaterialesRecicladosChart({
  data,
  isLoading,
  error,
}: MaterialesRecicladosChartProps) {
  return (
    <ChartCard
      title="Materiales reciclados"
      description="Total por tipo de material dentro del periodo seleccionado (kg)."
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
            top: 20,
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
                ? `${value.toLocaleString("es-MX")} kg`
                : `${value ?? 0} kg`,
              "Total",
            ]}
            contentStyle={{
              borderRadius: 8,
              border:
                "1px solid #e2e8f0",
            }}
          />

          <Bar
            dataKey="totalKg"
            fill={CHART_COLORS.primary}
            radius={[6, 6, 0, 0]}
          >
            <LabelList
              dataKey="totalKg"
              position="top"
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