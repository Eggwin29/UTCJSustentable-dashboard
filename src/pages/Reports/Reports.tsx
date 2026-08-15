
import ComponentSection from "@/components/ComponentSection/ComponentSection";
import StatCard from "@/components/charts/StatCard";
import MaterialesRecicladosChart from "@/components/charts/MaterialesRecicladosChart";
import DistribucionPorAñoChart from "@/components/charts/DistribucionPorAñoChart";
import ResiduosPorAñoChart from "@/components/charts/ResiduosPorAñoChart";
import Co2PorAñoChart from "@/components/charts/Co2PorAñoChart";
import ImpactoAmbientalChart from "@/components/charts/ImpactoAmbientalChart";
import PersonalPorTurnoChart from "@/components/charts/PersonalPorTurnoChart";
import PersonalTotalPorTurnoChart from "@/components/charts/PersonalTotalPorTurnoChart";
import PersonalTotalPorCuatrimestreChart from "@/components/charts/PersonalTotalPorCuatrimestreChart";
import ResumenMaterialesTable from "@/components/charts/ResumenMaterialesTable";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getTotalHistorico, getCo2Total } from "@/services/residuosService";
import LazyChartMount from "@/components/charts/LazyChartMount"

export default function Reportes() {
  const { data: totalHistorico, isLoading: loadingTotal } = useAsyncData(getTotalHistorico);
  const { data: co2Total, isLoading: loadingCo2 } = useAsyncData(getCo2Total);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Reportes</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Recolección de materiales y personal — datos de ejemplo, misma lógica que el reporte de PowerBI.
        </p>
      </section>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatCard label="Total Recolección Histórica" value={totalHistorico ?? 0} unit="kg" isLoading={loadingTotal} accent="emerald" />
        <StatCard label="CO₂ Evitado" value={co2Total ?? 0} unit="kg" isLoading={loadingCo2} accent="sky" />
      </div>

      {/* Residuos */}
      <ComponentSection title="Residuos" description="Recolección de material reciclado.">
        <div className="grid gap-6 lg:grid-cols-2">
          <LazyChartMount><MaterialesRecicladosChart /></LazyChartMount>
          <LazyChartMount><DistribucionPorAñoChart /></LazyChartMount>
          <LazyChartMount><ResiduosPorAñoChart /></LazyChartMount>
          <LazyChartMount><Co2PorAñoChart /></LazyChartMount>
        </div>
        <div className="mt-6">
          <LazyChartMount><ImpactoAmbientalChart /></LazyChartMount>
        </div>
      </ComponentSection>

      {/* Personal */}
      <ComponentSection title="Personal" description="Asistencia por turno y cuatrimestre.">
        <div className="grid gap-6 lg:grid-cols-2">
          <LazyChartMount><PersonalPorTurnoChart /></LazyChartMount>
          <LazyChartMount><PersonalTotalPorTurnoChart /></LazyChartMount>
          <LazyChartMount><PersonalTotalPorCuatrimestreChart /></LazyChartMount>
        </div>
      </ComponentSection>

      {/* Tabla resumen */}
      <ComponentSection title="Resumen de materiales" description="Detalle tabular de todo lo recolectado.">
        <ResumenMaterialesTable />
      </ComponentSection>
    </div>
  );
}