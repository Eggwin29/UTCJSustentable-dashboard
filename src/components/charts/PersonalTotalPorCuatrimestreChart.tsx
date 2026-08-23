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
  PersonalRecord,
} from "@/types/reportes";

interface CuatrimestreTotal {
  cuatrimestre: string;
  total: number;
}

interface PersonalTotalPorCuatrimestreChartProps {
  data: PersonalRecord[];
  isLoading?: boolean;
  error?: Error | null;
}

function renderLabel(
  entry: PieLabelRenderProps
) {
  const { total } =
    entry as unknown as CuatrimestreTotal;

  return total;
}

export default function PersonalTotalPorCuatrimestreChart({
  data,
  isLoading,
  error,
}: PersonalTotalPorCuatrimestreChartProps) {
  const chartData: CuatrimestreTotal[] =
    data.map((record) => ({
      cuatrimestre: record.cuatrimestre,
      total:
        record.tmMartes +
        record.tvJueves,
    }));

  return (
    <ChartCard
      title="Personal total por cuatrimestre"
      description="Participación acumulada por periodo académico."
      isLoading={isLoading}
      error={error}
    >
      <ResponsiveContainer
        width="100%"
        height={260}
        debounce={150}
      >
        <PieChart>
          <Pie
            data={chartData}
            dataKey="total"
            nameKey="cuatrimestre"
            innerRadius={55}
            outerRadius={85}
            label={renderLabel}
          >
            {chartData.map(
              (record, index) => (
                <Cell
                  key={record.cuatrimestre}
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

          <Tooltip />

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