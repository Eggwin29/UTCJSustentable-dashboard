import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getResiduosPorAño } from "@/services/residuosService";
import { CHART_COLORS } from "@/config/reportesConfig";

const AÑOS = [2022, 2023, 2024, 2025];

async function fetchAllYears() {
  const results = await Promise.all(AÑOS.map((año) => getResiduosPorAño(año)));
  return AÑOS.map((año, i) => ({ año, data: results[i] }));
}

const ResiduosPorAñoChart: React.FC = () => {
  const { data, isLoading, error } = useAsyncData(fetchAllYears);

  return (
    <ChartCard title="Recolección por año y material" isLoading={isLoading} error={error}>
      <div className="grid grid-cols-2 gap-4">
        {(data ?? []).map(({ año, data: yearData }) => (
          <div key={año}>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 text-center">{año}</p>
            <ResponsiveContainer width="100%" height={140} debounce={150}>
              <BarChart data={yearData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="tipoResiduo" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  formatter={(v) => [
                    typeof v === "number" ? `${v.toLocaleString("es-MX")} kg` : `${v ?? 0} kg`,
                    "Total",
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="totalKg" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </ChartCard>
  );
};

export default ResiduosPorAñoChart;