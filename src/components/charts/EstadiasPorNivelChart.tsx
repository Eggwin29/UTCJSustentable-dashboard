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
  EstadiasPorNivel,
} from "@/types/reportes";

interface EstadiasPorNivelChartProps {
  data: EstadiasPorNivel[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function EstadiasPorNivelChart({
  data,
  isLoading,
  error,
}: EstadiasPorNivelChartProps) {
  return (
    <ChartCard
      title="Participación por nivel"
      description="Distribución entre TSU, Licenciatura y registros sin nivel especificado."
      isLoading={isLoading}
      error={error}
    >
      <ResponsiveContainer
        width="100%"
        height={300}
        debounce={150}
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="participantes"
            nameKey="nivel"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            label={({ value }) =>
              typeof value === "number"
                ? value.toLocaleString(
                    "es-MX"
                  )
                : ""
            }
          >
            {data.map(
              (record, index) => (
                <Cell
                  key={record.nivel}
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
                ? value.toLocaleString(
                    "es-MX"
                  )
                : value ?? 0,
              "Participantes",
            ]}
          />

          <Legend
            wrapperStyle={{
              fontSize: 11,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}