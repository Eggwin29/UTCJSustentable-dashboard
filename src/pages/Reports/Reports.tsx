import Co2PorAñoChart from "@/components/charts/Co2PorAñoChart";
import DistribucionPorAñoChart from "@/components/charts/DistribucionPorAñoChart";
import EstadiasPorCarreraChart from "@/components/charts/EstadiasPorCarreraChart";
import EstadiasPorCuatrimestreChart from "@/components/charts/EstadiasPorCuatrimestreChart";
import EstadiasPorNivelChart from "@/components/charts/EstadiasPorNivelChart";
import ImpactoAmbientalChart from "@/components/charts/ImpactoAmbientalChart";
import LazyChartMount from "@/components/charts/LazyChartMount";
import MaterialesRecicladosChart from "@/components/charts/MaterialesRecicladosChart";
import PersonalPorTurnoChart from "@/components/charts/PersonalPorTurnoChart";
import PersonalTotalPorCuatrimestreChart from "@/components/charts/PersonalTotalPorCuatrimestreChart";
import PersonalTotalPorTurnoChart from "@/components/charts/PersonalTotalPorTurnoChart";
import ResiduosPorAñoChart from "@/components/charts/ResiduosPorAñoChart";
import ResumenMaterialesTable from "@/components/charts/ResumenMaterialesTable";
import StatCard from "@/components/charts/StatCard";
import ComponentSection from "@/components/ComponentSection/ComponentSection";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getEstadiasTotales } from "@/services/internshipReportsService";
import {
  getCo2Total,
  getTotalHistorico,
} from "@/services/residuosService";

export default function Reportes() {
  const {
    data: totalHistorico,
    isLoading: loadingTotal,
  } = useAsyncData(getTotalHistorico);

  const {
    data: co2Total,
    isLoading: loadingCo2,
  } = useAsyncData(getCo2Total);

  const {
    data: estadiasTotales,
    isLoading: loadingEstadias,
  } = useAsyncData(getEstadiasTotales);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Reportes
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Indicadores históricos de recolección, impacto ambiental y
          participación en UTCJ Sustentable.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <StatCard
          label="Total Recolección Histórica"
          value={totalHistorico ?? 0}
          unit="kg"
          isLoading={loadingTotal}
          accent="emerald"
        />

        <StatCard
          label="CO₂ Evitado"
          value={co2Total ?? 0}
          unit="kg"
          isLoading={loadingCo2}
          accent="sky"
        />
      </div>

      <ComponentSection
        title="Residuos"
        description="Recolección de material reciclado."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <LazyChartMount>
            <MaterialesRecicladosChart />
          </LazyChartMount>

          <LazyChartMount>
            <DistribucionPorAñoChart />
          </LazyChartMount>

          <LazyChartMount>
            <ResiduosPorAñoChart />
          </LazyChartMount>

          <LazyChartMount>
            <Co2PorAñoChart />
          </LazyChartMount>
        </div>

        <div className="mt-6">
          <LazyChartMount>
            <ImpactoAmbientalChart />
          </LazyChartMount>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Capital humano"
        description="Asistencia por turno y cuatrimestre."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <LazyChartMount>
            <PersonalPorTurnoChart />
          </LazyChartMount>

          <LazyChartMount>
            <PersonalTotalPorTurnoChart />
          </LazyChartMount>

          <LazyChartMount>
            <PersonalTotalPorCuatrimestreChart />
          </LazyChartMount>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Capital estadías"
        description="Participación por carrera, nivel académico y cuatrimestre."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Registros"
            value={estadiasTotales?.registros ?? 0}
            isLoading={loadingEstadias}
            decimals={0}
          />

          <StatCard
            label="Cuatrimestres"
            value={estadiasTotales?.cuatrimestres ?? 0}
            isLoading={loadingEstadias}
            accent="sky"
            decimals={0}
          />

          <StatCard
            label="Carreras participantes"
            value={estadiasTotales?.carreras ?? 0}
            isLoading={loadingEstadias}
            decimals={0}
          />

          <StatCard
            label="Participación total"
            value={estadiasTotales?.participantes ?? 0}
            isLoading={loadingEstadias}
            accent="sky"
            decimals={0}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <LazyChartMount>
            <EstadiasPorCarreraChart />
          </LazyChartMount>

          <LazyChartMount>
            <EstadiasPorNivelChart />
          </LazyChartMount>

          <div className="lg:col-span-2">
            <LazyChartMount>
              <EstadiasPorCuatrimestreChart />
            </LazyChartMount>
          </div>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Resumen de materiales"
        description="Detalle tabular de todo lo recolectado."
      >
        <ResumenMaterialesTable />
      </ComponentSection>
    </div>
  );
}