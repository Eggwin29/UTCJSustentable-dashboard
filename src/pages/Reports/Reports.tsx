import {
  useMemo,
  useState,
} from "react";

import {
  FiBarChart2,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiDatabase,
  FiInbox,
  FiPackage,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

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

import ReportGlobalFilters from "@/components/reports/ReportGlobalFilters";
import ReportSectionFilters from "@/components/reports/ReportSectionFilters";

import {
  useAsyncData,
} from "@/hooks/useAsyncData";

import {
  getReportesData,
  getReportFilterOptions,
} from "@/services/reportsService";

import {
  createDefaultReportFilters,
} from "@/types/reportes";

import type {
  ReportFilters,
} from "@/types/reportes";

const REPORT_SECTIONS = [
  {
    id: "reporte-residuos",
    label: "Residuos",
    icon: FiPackage,
  },
  {
    id: "reporte-capital-humano",
    label: "Capital humano",
    icon: FiUsers,
  },
  {
    id: "reporte-capital-estadias",
    label: "Capital estadías",
    icon: FiBriefcase,
  },
  {
    id: "resumen-materiales",
    label: "Resumen",
    icon: FiBookOpen,
  },
] as const;

export default function Reportes() {
  const [filters, setFilters] =
    useState<ReportFilters>(
      createDefaultReportFilters
    );

  const {
    data: filterOptions,
    isLoading:
      loadingFilterOptions,
    error: filterOptionsError,
  } = useAsyncData(
    getReportFilterOptions
  );

  const {
    data,
    isLoading,
    error,
  } = useAsyncData(
    () => getReportesData(filters),
    [filters]
  );

  const activeFilterCount =
    useMemo(
      () =>
        countActiveFilters(
          filters
        ),
      [filters]
    );

  const updateFilters = (
    changes: Partial<ReportFilters>
  ) => {
    setFilters((current) => ({
      ...current,
      ...changes,
    }));
  };

  const resetFilters = () => {
    setFilters(
      createDefaultReportFilters()
    );
  };

  const hasWasteResults =
    (
      data?.materialTotals.length ??
      0
    ) > 0;

  const hasHumanCapitalResults =
    (
      data?.personalPorCuatrimestre
        .length ?? 0
    ) > 0;

  const hasInternshipResults =
    (
      data?.estadiasTotales
        .registros ?? 0
    ) > 0;

  const humanCapitalTotal =
    (data?.personalTotales.tm ?? 0) +
    (data?.personalTotales.tv ?? 0);

  const reportScopeLabel =
    activeFilterCount === 0
      ? "Vista histórica completa"
      : `${activeFilterCount} ${
          activeFilterCount === 1
            ? "selección activa"
            : "selecciones activas"
        }`;

  return (
    <div className="space-y-8">
      <section
        id="reportes"
        tabIndex={-1}
        className="
          relative scroll-mt-28
          overflow-hidden rounded-2xl
          border border-slate-200
          bg-linear-to-r
          from-white via-white
          to-sky-50/80
          p-6 shadow-sm
          focus:outline-none
          dark:border-slate-700
          dark:from-slate-900
          dark:via-slate-900
          dark:to-sky-950/25
          sm:p-7
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute -right-14 -top-20
            h-48 w-48 rounded-full
            border-28
            border-sky-500/5
          "
        />

        <div className="relative">
          <div className="flex items-start gap-4">
            <div
              className="
                flex h-13 w-13 shrink-0
                items-center justify-center
                rounded-2xl
                bg-sky-100
                text-2xl text-sky-700
                dark:bg-sky-900/40
                dark:text-sky-300
              "
            >
              <FiBarChart2
                aria-hidden="true"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="
                    text-2xl font-bold
                    text-slate-900
                    dark:text-white
                    sm:text-3xl
                  "
                >
                  Reportes
                </h1>

                <span
                  className={
                    activeFilterCount > 0
                      ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }
                >
                  {reportScopeLabel}
                </span>
              </div>

              <p
                className="
                  mt-2 max-w-2xl
                  text-sm leading-6
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Analiza la recolección, el
                impacto ambiental y la
                participación de UTCJ
                Sustentable desde una vista
                histórica unificada.
              </p>
            </div>
          </div>

          <nav
            aria-label="Navegación del reporte"
            className="mt-5 flex flex-wrap gap-2"
          >
            {REPORT_SECTIONS.map(
              (section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="
                    inline-flex items-center
                    gap-2 rounded-lg border
                    border-slate-200
                    bg-white/80 px-3 py-2
                    text-xs font-semibold
                    text-slate-600
                    transition-colors
                    hover:border-emerald-300
                    hover:bg-emerald-50
                    hover:text-emerald-700
                    dark:border-slate-700
                    dark:bg-slate-900/70
                    dark:text-slate-300
                    dark:hover:border-emerald-800
                    dark:hover:bg-emerald-950/30
                    dark:hover:text-emerald-400
                  "
                >
                  <section.icon
                    aria-hidden="true"
                  />

                  {section.label}
                </a>
              )
            )}
          </nav>
        </div>
      </section>

      <section
        id="filtros-reportes"
        tabIndex={-1}
        className="
          scroll-mt-28
          focus:outline-none
        "
      >
        <ReportGlobalFilters
          filters={filters}
          options={filterOptions}
          isLoading={
            loadingFilterOptions
          }
          error={
            filterOptionsError
          }
          activeFilterCount={
            activeFilterCount
          }
          onChange={updateFilters}
          onReset={resetFilters}
        />
      </section>

      <div
        className="
          grid gap-5
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          label={
            activeFilterCount === 0
              ? "Total Recolección Histórica"
              : "Total Recolección Filtrada"
          }
          value={
            data?.totalHistorico ?? 0
          }
          unit="kg"
          isLoading={isLoading}
          accent="emerald"
          icon={
            <FiPackage
              aria-hidden="true"
            />
          }
          helper="Material reciclado incluido en la vista actual"
        />

        <StatCard
          label="CO₂ Evitado"
          value={
            data?.co2Total ?? 0
          }
          unit="kg"
          isLoading={isLoading}
          accent="sky"
          icon={
            <FiTrendingUp
              aria-hidden="true"
            />
          }
          helper="Impacto estimado con los factores históricos"
        />

        <StatCard
          label="Capital humano"
          value={humanCapitalTotal}
          isLoading={isLoading}
          accent="violet"
          decimals={0}
          icon={
            <FiUsers
              aria-hidden="true"
            />
          }
          helper="Participaciones de los turnos incluidos"
        />

        <StatCard
          label="Capital estadías"
          value={
            data?.estadiasTotales
              .participantes ?? 0
          }
          isLoading={isLoading}
          accent="amber"
          decimals={0}
          icon={
            <FiBriefcase
              aria-hidden="true"
            />
          }
          helper="Participantes de carreras y niveles seleccionados"
        />
      </div>

      <section
        id="reporte-residuos"
        tabIndex={-1}
        className="
          scroll-mt-28
          focus:outline-none
        "
      >
        <ComponentSection
          title="Residuos"
          description="Recolección de material reciclado."
        >
          <ReportSectionFilters
            section="waste"
            filters={filters}
            options={filterOptions}
            isLoading={
              loadingFilterOptions
            }
            onChange={
              updateFilters
            }
          />

          {!isLoading &&
          !error &&
          !hasWasteResults ? (
            <NoResultsNotice
              title="Sin datos de residuos"
              description="No hay recolecciones que coincidan con el periodo y material seleccionados."
            />
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <div
                  id="materiales-reciclados"
                  tabIndex={-1}
                  className="
                    scroll-mt-28
                    focus:outline-none
                  "
                >
                  <LazyChartMount>
                    <MaterialesRecicladosChart
                      data={
                        data?.materialTotals ??
                        []
                      }
                      isLoading={
                        isLoading
                      }
                      error={error}
                    />
                  </LazyChartMount>
                </div>

                <div
                  id="distribucion-recoleccion-anual"
                  tabIndex={-1}
                  className="
                    scroll-mt-28
                    focus:outline-none
                  "
                >
                  <LazyChartMount>
                    <DistribucionPorAñoChart
                      data={
                        data?.añoTotals ??
                        []
                      }
                      isLoading={
                        isLoading
                      }
                      error={error}
                    />
                  </LazyChartMount>
                </div>

                <div
                  id="recoleccion-anual-material"
                  tabIndex={-1}
                  className="
                    scroll-mt-28
                    focus:outline-none
                  "
                >
                  <LazyChartMount>
                    <ResiduosPorAñoChart
                      years={
                        data?.availableYears ??
                        []
                      }
                      dataByYear={
                        data?.residuosPorAño ??
                        {}
                      }
                      isLoading={
                        isLoading
                      }
                      error={error}
                    />
                  </LazyChartMount>
                </div>

                <div
                  id="co2-evitado-anual"
                  tabIndex={-1}
                  className="
                    scroll-mt-28
                    focus:outline-none
                  "
                >
                  <LazyChartMount>
                    <Co2PorAñoChart
                      data={
                        data?.añoTotals ??
                        []
                      }
                      isLoading={
                        isLoading
                      }
                      error={error}
                    />
                  </LazyChartMount>
                </div>
              </div>

              <div
                id="impacto-ambiental-material"
                tabIndex={-1}
                className="
                  mt-6 scroll-mt-28
                  focus:outline-none
                "
              >
                <LazyChartMount>
                  <ImpactoAmbientalChart
                    data={
                      data?.materialTotals ??
                      []
                    }
                    isLoading={
                      isLoading
                    }
                    error={error}
                  />
                </LazyChartMount>
              </div>
            </>
          )}
        </ComponentSection>
      </section>

      <section
        id="reporte-capital-humano"
        tabIndex={-1}
        className="
          scroll-mt-28
          focus:outline-none
        "
      >
        <ComponentSection
          title="Capital humano"
          description="Asistencia por turno y cuatrimestre."
        >
          <ReportSectionFilters
            section="human-capital"
            filters={filters}
            options={filterOptions}
            isLoading={
              loadingFilterOptions
            }
            onChange={
              updateFilters
            }
          />

          {!isLoading &&
          !error &&
          !hasHumanCapitalResults ? (
            <NoResultsNotice
              title="Sin datos de Capital humano"
              description="No hay registros de participación para el periodo seleccionado."
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <div
                id="personal-turno-cuatrimestre"
                tabIndex={-1}
                className="
                  scroll-mt-28
                  focus:outline-none
                "
              >
                <LazyChartMount>
                  <PersonalPorTurnoChart
                    data={
                      data?.personalPorCuatrimestre ??
                      []
                    }
                    turn={
                      filters.personalTurn
                    }
                    isLoading={
                      isLoading
                    }
                    error={error}
                  />
                </LazyChartMount>
              </div>

              <div
                id="personal-total-turno"
                tabIndex={-1}
                className="
                  scroll-mt-28
                  focus:outline-none
                "
              >
                <LazyChartMount>
                  <PersonalTotalPorTurnoChart
                    totals={
                      data?.personalTotales ?? {
                        tm: 0,
                        tv: 0,
                      }
                    }
                    turn={
                      filters.personalTurn
                    }
                    isLoading={
                      isLoading
                    }
                    error={error}
                  />
                </LazyChartMount>
              </div>

              <div
                id="personal-total-cuatrimestre"
                tabIndex={-1}
                className="
                  scroll-mt-28
                  focus:outline-none
                "
              >
                <LazyChartMount>
                  <PersonalTotalPorCuatrimestreChart
                    data={
                      data?.personalPorCuatrimestre ??
                      []
                    }
                    isLoading={
                      isLoading
                    }
                    error={error}
                  />
                </LazyChartMount>
              </div>
            </div>
          )}
        </ComponentSection>
      </section>

      <section
        id="reporte-capital-estadias"
        tabIndex={-1}
        className="
          scroll-mt-28
          focus:outline-none
        "
      >
        <ComponentSection
          title="Capital estadías"
          description="Participación por carrera, nivel académico y cuatrimestre."
        >
          <ReportSectionFilters
            section="internships"
            filters={filters}
            options={filterOptions}
            isLoading={
              loadingFilterOptions
            }
            onChange={
              updateFilters
            }
          />

          <div
            className="
              grid gap-6
              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            <StatCard
              label="Registros"
              value={
                data?.estadiasTotales
                  .registros ?? 0
              }
              isLoading={isLoading}
              decimals={0}
              icon={
                <FiDatabase
                  aria-hidden="true"
                />
              }
              helper="Combinaciones incluidas en la vista"
            />

            <StatCard
              label="Cuatrimestres"
              value={
                data?.estadiasTotales
                  .cuatrimestres ?? 0
              }
              isLoading={isLoading}
              accent="sky"
              decimals={0}
              icon={
                <FiCalendar
                  aria-hidden="true"
                />
              }
              helper="Periodos con participación registrada"
            />

            <StatCard
              label="Carreras participantes"
              value={
                data?.estadiasTotales
                  .carreras ?? 0
              }
              isLoading={isLoading}
              accent="violet"
              decimals={0}
              icon={
                <FiBookOpen
                  aria-hidden="true"
                />
              }
              helper="Carreras presentes en los resultados"
            />

            <StatCard
              label="Participación total"
              value={
                data?.estadiasTotales
                  .participantes ?? 0
              }
              isLoading={isLoading}
              accent="emerald"
              decimals={0}
              icon={
                <FiUsers
                  aria-hidden="true"
                />
              }
              helper="Participación acumulada de estadías"
            />
          </div>

          {!isLoading &&
          !error &&
          !hasInternshipResults ? (
            <div className="mt-6">
              <NoResultsNotice
                title="Sin datos de Capital estadías"
                description="No hay participaciones que coincidan con el periodo, carrera y nivel seleccionados."
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div
                id="estadias-por-carrera"
                tabIndex={-1}
                className="
                  scroll-mt-28
                  focus:outline-none
                "
              >
                <LazyChartMount>
                  <EstadiasPorCarreraChart
                    data={
                      data?.estadiasPorCarrera ??
                      []
                    }
                    isLoading={
                      isLoading
                    }
                    error={error}
                  />
                </LazyChartMount>
              </div>

              <div
                id="estadias-por-nivel"
                tabIndex={-1}
                className="
                  scroll-mt-28
                  focus:outline-none
                "
              >
                <LazyChartMount>
                  <EstadiasPorNivelChart
                    data={
                      data?.estadiasPorNivel ??
                      []
                    }
                    isLoading={
                      isLoading
                    }
                    error={error}
                  />
                </LazyChartMount>
              </div>

              <div
                id="estadias-por-cuatrimestre"
                tabIndex={-1}
                className="
                  scroll-mt-28
                  focus:outline-none
                  lg:col-span-2
                "
              >
                <LazyChartMount>
                  <EstadiasPorCuatrimestreChart
                    data={
                      data?.estadiasPorCuatrimestre ??
                      []
                    }
                    isLoading={
                      isLoading
                    }
                    error={error}
                  />
                </LazyChartMount>
              </div>
            </div>
          )}
        </ComponentSection>
      </section>

      <section
        id="resumen-materiales"
        tabIndex={-1}
        className="
          scroll-mt-28
          focus:outline-none
        "
      >
        <ComponentSection
          title="Resumen de materiales"
          description="Detalle tabular de los materiales incluidos en los filtros de Residuos."
        >
          <ResumenMaterialesTable
            materials={
              data?.materialTotals ??
              []
            }
            total={
              data?.totalHistorico ??
              0
            }
            isLoading={isLoading}
          />
        </ComponentSection>
      </section>
    </div>
  );
}

interface NoResultsNoticeProps {
  title: string;
  description: string;
}

function NoResultsNotice({
  title,
  description,
}: NoResultsNoticeProps) {
  return (
    <div
      className="
        flex flex-col items-center
        justify-center rounded-xl
        border border-dashed
        border-slate-300
        bg-slate-50
        px-6 py-12 text-center
        dark:border-slate-700
        dark:bg-slate-950/40
      "
    >
      <div
        className="
          rounded-full bg-slate-200
          p-3 text-slate-500
          dark:bg-slate-800
          dark:text-slate-400
        "
      >
        <FiInbox
          size={24}
          aria-hidden="true"
        />
      </div>

      <p
        className="
          mt-4 font-semibold
          text-slate-700
          dark:text-slate-200
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1 max-w-md text-sm
          text-slate-500
          dark:text-slate-400
        "
      >
        {description}
      </p>
    </div>
  );
}

function countActiveFilters(
  filters: ReportFilters
): number {
  const activePeriodSelections =
    filters.periodMode === "year"
      ? filters.years.values.length
      : filters.periodMode ===
          "academic-term"
        ? filters
            .academicTermIds
            .values.length
        : 0;

  return (
    activePeriodSelections +
    filters.materials.values.length +
    Number(
      filters.personalTurn !==
        "all"
    ) +
    filters
      .academicProgramIds
      .values.length +
    filters
      .academicLevels
      .values.length
  );
}