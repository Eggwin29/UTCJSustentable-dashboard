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

interface ResiduosPorAñoChartProps {
  years: number[];

  dataByYear: Record<
    number,
    MaterialTotal[]
  >;

  isLoading?: boolean;
  error?: Error | null;
}

export default function ResiduosPorAñoChart({
  years,
  dataByYear,
  isLoading,
  error,
}: ResiduosPorAñoChartProps) {
  return (
    <ChartCard
      title="Recolección por año y material"
      description="Desglose anual del resultado filtrado."
      isLoading={isLoading}
      error={error}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {years.map((year) => (
          <div key={year}>
            <p className="mb-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
              {year}
            </p>

            <ResponsiveContainer
              width="100%"
              height={140}
              debounce={150}
            >
              <BarChart
                data={
                  dataByYear[year] ?? []
                }
                margin={{
                  top: 5,
                  right: 5,
                  left: 0,
                  bottom: 0,
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
                    fontSize: 9,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 9,
                    fill: "#64748b",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />

                <Tooltip
                  formatter={(value) => [
                    typeof value ===
                    "number"
                      ? `${value.toLocaleString("es-MX")} kg`
                      : `${value ?? 0} kg`,
                    "Total",
                  ]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                  }}
                />

                <Bar
                  dataKey="totalKg"
                  fill={
                    CHART_COLORS.primary
                  }
                  radius={[
                    4,
                    4,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}