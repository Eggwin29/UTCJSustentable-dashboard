import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "@/components/charts/ChartCard";
import { CHART_COLORS } from "@/config/reportesConfig";

import type {
  PersonalRecord,
  PersonalTurnFilter,
} from "@/types/reportes";

interface PersonalPorTurnoChartProps {
  data: PersonalRecord[];
  turn: PersonalTurnFilter;
  isLoading?: boolean;
  error?: Error | null;
}

export default function PersonalPorTurnoChart({
  data,
  turn,
  isLoading,
  error,
}: PersonalPorTurnoChartProps) {
  return (
    <ChartCard
      title="Personal por turno y cuatrimestre"
      description="Comparación de participación por periodo académico."
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
            dataKey="cuatrimestre"
            tick={{
              fontSize: 10,
              fill: "#64748b",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            allowDecimals={false}
            tick={{
              fontSize: 12,
              fill: "#64748b",
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          />

          <Legend />

          {turn !== "tv" && (
            <Bar
              dataKey="tmMartes"
              name="TM Martes"
              fill={CHART_COLORS.tm}
              radius={[4, 4, 0, 0]}
            />
          )}

          {turn !== "tm" && (
            <Bar
              dataKey="tvJueves"
              name="TV Jueves"
              fill={CHART_COLORS.tv}
              radius={[4, 4, 0, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}