import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import ChartCard from "./ChartCard";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getMaterialTotals } from "@/services/residuosService";
import { CHART_COLORS } from "@/config/reportesConfig";

const MaterialesRecicladosChart: React.FC = () => {
  const { data, isLoading, error } = useAsyncData(getMaterialTotals);

  return (
    <ChartCard title="Materiales Reciclados" description="Total histórico por tipo de material (kg)." isLoading={isLoading} error={error}>
      <ResponsiveContainer width="100%" height={280} debounce={150}>
        <BarChart data={data ?? []} margin={{ top: 20, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="tipoResiduo" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [
              typeof value === "number" ? `${value.toLocaleString("es-MX")} kg` : `${value ?? 0} kg`,
              "Total",
            ]}
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="totalKg" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]}>
            <LabelList
              dataKey="totalKg"
              position="top"
              formatter={(v) => (typeof v === "number" ? v.toLocaleString("es-MX") : `${v ?? ""}`)}
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default MaterialesRecicladosChart;