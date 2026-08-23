import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type {
  PieLabelRenderProps,
} from "recharts";

import ChartCard from "@/components/charts/ChartCard";
import { CHART_COLORS } from "@/config/reportesConfig";

import type {
  AñoTotal,
} from "@/types/reportes";

interface DistribucionPorAñoChartProps {
  data: AñoTotal[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function DistribucionPorAñoChart({
  data,
  isLoading,
  error,
}: DistribucionPorAñoChartProps) {
  const renderLabel = (
    entry: PieLabelRenderProps
  ) => {
    const {
      totalKg,
      porcentaje,
    } = entry as unknown as AñoTotal;

    const kgLabel =
      typeof totalKg === "number"
        ? totalKg.toLocaleString(
            "es-MX"
          )
        : "0";

    const percentageLabel =
      typeof porcentaje === "number"
        ? `${porcentaje.toFixed(2)}%`
        : "";

    return `${kgLabel} (${percentageLabel})`;
  };

  return (
    <ChartCard
      title="Distribución de recolección por año"
      description="Participación de cada año dentro del resultado filtrado."
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
            data={data}
            dataKey="totalKg"
            nameKey="año"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            label={renderLabel}
          >
            {data.map(
              (record, index) => (
                <Cell
                  key={record.año}
                  fill={
                    CHART_COLORS.categorical[
                      index %
                        CHART_COLORS
                          .categorical
                          .length
                    ]
                  }
                />
              )
            )}
          </Pie>

          <Tooltip
            formatter={(value) => [
              typeof value === "number"
                ? `${value.toLocaleString("es-MX")} kg`
                : `${value ?? 0} kg`,
              "Total",
            ]}
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}