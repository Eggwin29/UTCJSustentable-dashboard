import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getPersonalTotales } from "@/services/personalService";
import { CHART_COLORS } from "@/config/reportesConfig";

const PersonalTotalPorTurnoChart: React.FC = () => {
  const { data, isLoading, error } = useAsyncData(getPersonalTotales);
  const chartData = data ? [{ name: "TM Martes", value: data.tm }, { name: "TV Jueves", value: data.tv }] : [];

  return (
    <ChartCard title="Personal Total por Turno" isLoading={isLoading} error={error}>
      <ResponsiveContainer width="100%" height={280} debounce={150}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} label={({ value }) => value}>
            <Cell fill={CHART_COLORS.tm} />
            <Cell fill={CHART_COLORS.tv} />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default PersonalTotalPorTurnoChart;