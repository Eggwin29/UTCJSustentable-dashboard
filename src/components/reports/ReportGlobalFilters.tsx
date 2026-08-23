import {
  FiCalendar,
  FiFilter,
  FiInfo,
  FiRefreshCw,
} from "react-icons/fi";

import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import ReportMultiSelect from "@/components/reports/ReportMultiSelect";

import {
  HISTORICAL_WITHOUT_TERM_ID,
} from "@/types/reportes";

import type {
  ReportFilterOptions,
  ReportFilters,
  ReportPeriodMode,
  ReportSelection,
} from "@/types/reportes";

interface ReportGlobalFiltersProps {
  filters: ReportFilters;
  options: ReportFilterOptions | null;
  isLoading: boolean;
  error: Error | null;
  activeFilterCount: number;

  onChange: (
    changes: Partial<ReportFilters>
  ) => void;

  onReset: () => void;
}

const periodModes: Array<{
  value: ReportPeriodMode;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "Todo",
    description:
      "Consulta el historial completo.",
  },
  {
    value: "year",
    label: "Por años",
    description:
      "Incluye o excluye varios años.",
  },
  {
    value: "academic-term",
    label: "Por cuatrimestres",
    description:
      "Combina periodos académicos específicos.",
  },
];

export default function ReportGlobalFilters({
  filters,
  options,
  isLoading,
  error,
  activeFilterCount,
  onChange,
  onReset,
}: ReportGlobalFiltersProps) {
  const years =
    options?.years ?? [];

  const academicTerms =
    options?.academicTerms ?? [];

  const academicTermOptions = [
    ...academicTerms.map(
      (academicTerm) => ({
        value: academicTerm.id,
        label: academicTerm.label,
      })
    ),

    ...(options
      ?.hasHistoricalWithoutAcademicTerm
      ? [
          {
            value:
              HISTORICAL_WITHOUT_TERM_ID,

            label:
              "Históricos sin cuatrimestre",
          },
        ]
      : []),
  ];

  const activeLabels =
    getActiveFilterLabels(
      filters,
      options
    );

  return (
    <Card variant="outlined">
      <Card.Header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <FiFilter
                size={20}
                aria-hidden="true"
              />
            </div>

            <div>
              <Card.Title>
                Filtros del reporte
              </Card.Title>

              <Card.Description>
                Combina periodos y filtros específicos. Puedes mostrar solamente lo marcado o excluirlo del reporte.
              </Card.Description>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                activeFilterCount > 0
                  ? "primary"
                  : "secondary"
              }
              size="md"
            >
              {activeFilterCount === 0
                ? "Sin filtros activos"
                : `${activeFilterCount} ${
                    activeFilterCount === 1
                      ? "selección activa"
                      : "selecciones activas"
                  }`}
            </Badge>

            <Button
              type="button"
              variant={
                activeFilterCount > 0
                  ? "danger"
                  : "ghost"
              }
              size="sm"
              leftIcon={
                <FiRefreshCw />
              }
              onClick={onReset}
              disabled={
                activeFilterCount === 0
              }
            >
              Limpiar todo
            </Button>
          </div>
        </div>
      </Card.Header>

      <Card.Body className="space-y-5">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <FiCalendar
              className="text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Alcance del periodo
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Primero elige cómo quieres agrupar la selección temporal.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {periodModes.map(
              (periodMode) => {
                const isActive =
                  filters.periodMode ===
                  periodMode.value;

                return (
                  <button
                    key={
                      periodMode.value
                    }
                    type="button"
                    aria-pressed={
                      isActive
                    }
                    disabled={isLoading}
                    onClick={() =>
                      onChange({
                        periodMode:
                          periodMode.value,
                      })
                    }
                    className={
                      isActive
                        ? "rounded-xl border border-emerald-600 bg-emerald-600 p-3 text-left text-white shadow-sm transition-colors"
                        : "rounded-xl border border-slate-200 bg-white p-3 text-left text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30"
                    }
                  >
                    <span className="block text-sm font-semibold">
                      {
                        periodMode.label
                      }
                    </span>

                    <span
                      className={
                        isActive
                          ? "mt-1 block text-xs text-emerald-50"
                          : "mt-1 block text-xs text-slate-500 dark:text-slate-400"
                      }
                    >
                      {
                        periodMode.description
                      }
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {filters.periodMode ===
          "all" && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/50">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Vista histórica completa
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Incluye todos los años, cuatrimestres y registros históricos sin periodo relacionado.
            </p>
          </div>
        )}

        {filters.periodMode ===
          "year" && (
          <ReportMultiSelect
            id="report-years"
            label="Años"
            options={years.map(
              (year) => ({
                value: year,
                label: String(year),
              })
            )}
            selection={filters.years}
            onChange={(
              yearsSelection
            ) =>
              onChange({
                years:
                  yearsSelection,
              })
            }
            placeholder="Todos los años"
            helperText="Marca varios años o usa Excluir para mostrar todos menos los seleccionados."
            searchPlaceholder="Buscar año..."
            disabled={isLoading}
          />
        )}

        {filters.periodMode ===
          "academic-term" && (
          <div className="space-y-3">
            <ReportMultiSelect
              id="report-academic-terms"
              label="Cuatrimestres"
              options={
                academicTermOptions
              }
              selection={
                filters.academicTermIds
              }
              onChange={(
                academicTermIds
              ) =>
                onChange({
                  academicTermIds,
                })
              }
              placeholder="Todos los cuatrimestres"
              helperText="Puedes comparar dos o más periodos o excluir periodos concretos."
              searchPlaceholder="Buscar cuatrimestre..."
              disabled={isLoading}
            />

            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              <FiInfo
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />

              <p>
                Los registros sin cuatrimestre aparecen como una opción independiente. Así puedes incluirlos o excluirlos sin inventarles un periodo académico.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            No se pudieron cargar las opciones de filtrado. Recarga la página para intentarlo nuevamente.
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Vista actual
          </p>

          <div className="flex flex-wrap gap-2">
            {activeLabels.length ===
            0 ? (
              <Badge
                variant="secondary"
                size="md"
              >
                Sin restricciones
              </Badge>
            ) : (
              activeLabels.map(
                (label) => (
                  <Badge
                    key={label}
                    variant="outline"
                    size="md"
                  >
                    {label}
                  </Badge>
                )
              )
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

function getActiveFilterLabels(
  filters: ReportFilters,
  options: ReportFilterOptions | null
): string[] {
  const labels: string[] = [];

  if (
    filters.periodMode === "year"
  ) {
    const label = getSelectionLabel(
      "Años",
      filters.years,
      (value) => String(value)
    );

    if (label) {
      labels.push(label);
    }
  }

  if (
    filters.periodMode ===
    "academic-term"
  ) {
    const label = getSelectionLabel(
      "Cuatrimestres",
      filters.academicTermIds,
      (value) => {
        if (
          value ===
          HISTORICAL_WITHOUT_TERM_ID
        ) {
          return "Históricos sin periodo";
        }

        return (
          options?.academicTerms.find(
            (option) =>
              option.id === value
          )?.label ?? "Periodo"
        );
      }
    );

    if (label) {
      labels.push(label);
    }
  }

  const materialLabel =
    getSelectionLabel(
      "Materiales",
      filters.materials,
      (value) => value
    );

  if (materialLabel) {
    labels.push(materialLabel);
  }

  if (
    filters.personalTurn === "tm"
  ) {
    labels.push(
      "Turno: TM Martes"
    );
  }

  if (
    filters.personalTurn === "tv"
  ) {
    labels.push(
      "Turno: TV Jueves"
    );
  }

  const programLabel =
    getSelectionLabel(
      "Carreras",
      filters.academicProgramIds,
      (value) =>
        options?.academicPrograms.find(
          (option) =>
            option.id === value
        )?.name ?? "Carrera"
    );

  if (programLabel) {
    labels.push(programLabel);
  }

  const levelLabel =
    getSelectionLabel(
      "Niveles",
      filters.academicLevels,
      (value) => value
    );

  if (levelLabel) {
    labels.push(levelLabel);
  }

  return labels;
}

function getSelectionLabel<
  T extends string | number,
>(
  name: string,
  selection: ReportSelection<T>,
  getLabel: (value: T) => string
): string | null {
  if (
    selection.values.length === 0
  ) {
    return null;
  }

  const prefix =
    selection.mode === "exclude"
      ? `${name}: excepto`
      : `${name}:`;

  if (
    selection.values.length <= 2
  ) {
    return `${prefix} ${selection.values
      .map(getLabel)
      .join(", ")}`;
  }

  return `${prefix} ${selection.values.length} seleccionados`;
}