import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "@/components/charts/ChartCard";
import {
  CHART_COLORS,
} from "@/config/reportesConfig";

import {
  useMediaQuery,
} from "@/hooks/useMediaQuery";

import type {
  EstadiasPorCarrera,
} from "@/types/reportes";

interface EstadiasPorCarreraChartProps {
  data: EstadiasPorCarrera[];
  isLoading?: boolean;
  error?: Error | null;
}

export default function EstadiasPorCarreraChart({
  data,
  isLoading,
  error,
}: EstadiasPorCarreraChartProps) {
  const isMobile = useMediaQuery(
    "(max-width: 639px)"
  );

  return (
    <ChartCard
      title="Participación por carrera"
      description="Total de participaciones de estadías por carrera."
      isLoading={isLoading}
      error={error}
    >
      {isMobile ? (
        <MobileCareerChart
          data={data}
        />
      ) : (
        <DesktopCareerChart
          data={data}
        />
      )}
    </ChartCard>
  );
}

function MobileCareerChart({
  data,
}: {
  data: EstadiasPorCarrera[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex min-h-56 items-center justify-center px-4 text-center text-sm text-slate-500 dark:text-slate-400">
        No hay participación por carrera
        para la selección actual.
      </div>
    );
  }

  const maximumValue = Math.max(
    ...data.map(
      (item) => item.participantes
    ),
    1
  );

  return (
    <div
      className="space-y-4 py-2"
      role="list"
      aria-label="Participación por carrera"
    >
      {data.map((item, index) => {
        const percentage =
          (item.participantes /
            maximumValue) *
          100;

        return (
          <div
            key={item.carrera}
            role="listitem"
            className="space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 px-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {index + 1}
                </span>

                <span className="text-sm font-medium leading-5 text-slate-700 dark:text-slate-200">
                  {item.carrera}
                </span>
              </div>

              <span className="shrink-0 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {formatParticipants(
                  item.participantes
                )}
              </span>
            </div>

            <div
              className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
              role="progressbar"
              aria-label={`${item.carrera}: ${formatParticipants(
                item.participantes
              )} participantes`}
              aria-valuemin={0}
              aria-valuemax={maximumValue}
              aria-valuenow={
                item.participantes
              }
            >
              <div
                className="h-full min-w-1 rounded-full bg-emerald-600 transition-[width] duration-300 dark:bg-emerald-500"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DesktopCareerChart({
  data,
}: {
  data: EstadiasPorCarrera[];
}) {
  const chartHeight = Math.max(
    300,
    data.length * 48
  );

  return (
    <ResponsiveContainer
      width="100%"
      height={chartHeight}
      debounce={150}
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 10,
          right: 45,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
        />

        <XAxis
          type="number"
          allowDecimals={false}
          tick={{
            fontSize: 12,
          }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          type="category"
          dataKey="carrera"
          width={145}
          tick={{
            fontSize: 11,
          }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          cursor={false}
          formatter={(value) => [
            typeof value === "number"
              ? formatParticipants(value)
              : value ?? 0,
            "Participantes",
          ]}
        />

        <Bar
          dataKey="participantes"
          fill={CHART_COLORS.primary}
          radius={[0, 6, 6, 0]}
        >
          <LabelList
            dataKey="participantes"
            position="right"
            formatter={(value) =>
              typeof value === "number"
                ? formatParticipants(
                    value
                  )
                : ""
            }
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function formatParticipants(
  value: number
) {
  return value.toLocaleString(
    "es-MX"
  );
}