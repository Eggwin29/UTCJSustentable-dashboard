import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import ChartCard from "@/components/charts/ChartCard";
import { CHART_COLORS } from "@/config/reportesConfig";

import type {
  PersonalTurnFilter,
} from "@/types/reportes";

interface PersonalTotalPorTurnoChartProps {
  totals: {
    tm: number;
    tv: number;
  };
  turn: PersonalTurnFilter;
  isLoading?: boolean;
  error?: Error | null;
}

export default function PersonalTotalPorTurnoChart({
  totals,
  turn,
  isLoading,
  error,
}: PersonalTotalPorTurnoChartProps) {
  const chartData = [
    ...(turn !== "tv"
      ? [
          {
            name: "TM Martes",
            value: totals.tm,
            color: CHART_COLORS.tm,
          },
        ]
      : []),

    ...(turn !== "tm"
      ? [
          {
            name: "TV Jueves",
            value: totals.tv,
            color: CHART_COLORS.tv,
          },
        ]
      : []),
  ];

  return (
    <ChartCard
      title="Personal total por turno"
      description="Distribución acumulada dentro del periodo seleccionado."
      isLoading={isLoading}
      error={error}
    >
      <ResponsiveContainer
        width="100%"
        height={280}
        debounce={150}
      >
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={80}
            label={({ value }) => value}
          >
            {chartData.map((record) => (
              <Cell
                key={record.name}
                fill={record.color}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}