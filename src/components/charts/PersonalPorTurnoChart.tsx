import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getPersonalPorCuatrimestre } from "@/services/personalService";
import { CHART_COLORS } from "@/config/reportesConfig";

const PersonalPorTurnoChart: React.FC = () => {
  const { data, isLoading, error } = useAsyncData(getPersonalPorCuatrimestre);

  return (
    <ChartCard title="Personal por Turno y Cuatrimestre" isLoading={isLoading} error={error}>
      <ResponsiveContainer width="100%" height={280} debounce={150}>
        <BarChart data={data ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="cuatrimestre" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
          <Legend />
          <Bar dataKey="tmMartes" name="TM Martes" fill={CHART_COLORS.tm} radius={[4, 4, 0, 0]} />
          <Bar dataKey="tvJueves" name="TV Jueves" fill={CHART_COLORS.tv} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default PersonalPorTurnoChart;