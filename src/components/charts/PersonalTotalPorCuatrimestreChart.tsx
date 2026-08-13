import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import ChartCard from "./ChartCard";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getPersonalPorCuatrimestre } from "@/services/personalService";
import { CHART_COLORS } from "@/config/reportesConfig";

interface CuatrimestreTotal {
  cuatrimestre: string;
  total: number;
}

async function fetchTotalsPorCuatrimestre(): Promise<CuatrimestreTotal[]> {
  const data = await getPersonalPorCuatrimestre();
  return data.map((r) => ({ cuatrimestre: r.cuatrimestre, total: r.tmMartes + r.tvJueves }));
}

const renderLabel = (entry: PieLabelRenderProps) => {
  const { total } = entry as unknown as CuatrimestreTotal;
  return total;
};

const PersonalTotalPorCuatrimestreChart: React.FC = () => {
  const { data, isLoading, error } = useAsyncData(fetchTotalsPorCuatrimestre);

  return (
    <ChartCard title="Personal Total por Cuatrimestre" isLoading={isLoading} error={error}>
      <ResponsiveContainer width="100%" height={260} debounce={150}>
        <PieChart>
          <Pie data={data ?? []} dataKey="total" nameKey="cuatrimestre" innerRadius={55} outerRadius={85} label={renderLabel}>
            {(data ?? []).map((_, index) => (
              <Cell key={index} fill={CHART_COLORS.categorical[index % CHART_COLORS.categorical.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default PersonalTotalPorCuatrimestreChart;