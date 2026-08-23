import {
  FiFilter,
  FiX,
} from "react-icons/fi";

import Button from "@/components/ui/button";

import ReportMultiSelect from "@/components/reports/ReportMultiSelect";

import type {
  PersonalTurnFilter,
  ReportFilterOptions,
  ReportFilters,
} from "@/types/reportes";

type ReportSection =
  | "waste"
  | "human-capital"
  | "internships";

interface ReportSectionFiltersProps {
  section: ReportSection;
  filters: ReportFilters;
  options: ReportFilterOptions | null;
  isLoading: boolean;

  onChange: (
    changes: Partial<ReportFilters>
  ) => void;
}

const turnOptions: Array<{
  value: PersonalTurnFilter;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "Ambos",
    description: "TM y TV",
  },
  {
    value: "tm",
    label: "TM Martes",
    description:
      "Solo turno matutino",
  },
  {
    value: "tv",
    label: "TV Jueves",
    description:
      "Solo turno vespertino",
  },
];

export default function ReportSectionFilters({
  section,
  filters,
  options,
  isLoading,
  onChange,
}: ReportSectionFiltersProps) {
  const activeCount =
    getSectionActiveCount(
      section,
      filters
    );

  const resetSection = () => {
    if (section === "waste") {
      onChange({
        materials: {
          mode: "include",
          values: [],
        },
      });

      return;
    }

    if (
      section === "human-capital"
    ) {
      onChange({
        personalTurn: "all",
      });

      return;
    }

    onChange({
      academicProgramIds: {
        mode: "include",
        values: [],
      },

      academicLevels: {
        mode: "include",
        values: [],
      },
    });
  };

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/40">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiFilter
            className="text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />

          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Filtros de esta sección
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {getSectionDescription(
                section
              )}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant={
            activeCount > 0
              ? "danger"
              : "ghost"
          }
          size="sm"
          leftIcon={<FiX />}
          onClick={resetSection}
          disabled={
            activeCount === 0
          }
        >
          {section === "waste"
            ? "Limpiar materiales"
            : "Limpiar sección"}
        </Button>
      </div>

      {section === "waste" && (
        <ReportMultiSelect
          id="report-material-filter"
          label="Materiales"
          options={(
            options?.materials ?? []
          ).map((material) => ({
            value: material,
            label: material,
          }))}
          selection={
            filters.materials
          }
          onChange={(materials) =>
            onChange({
              materials,
            })
          }
          placeholder="Todos los materiales"
          helperText="Selecciona exactamente qué materiales incluir o cuáles excluir."
          searchPlaceholder="Buscar material..."
          disabled={isLoading}
        />
      )}

      {section ===
        "human-capital" && (
        <div>
          <p className="mb-2 px-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Turno
          </p>

          <div className="grid gap-2 sm:grid-cols-3">
            {turnOptions.map(
              (option) => {
                const isActive =
                  filters.personalTurn ===
                  option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={
                      isActive
                    }
                    disabled={isLoading}
                    onClick={() =>
                      onChange({
                        personalTurn:
                          option.value,
                      })
                    }
                    className={
                      isActive
                        ? "rounded-xl border border-emerald-600 bg-emerald-600 px-3 py-2 text-left text-white transition-colors"
                        : "rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-emerald-950/30"
                    }
                  >
                    <span className="block text-sm font-semibold">
                      {
                        option.label
                      }
                    </span>

                    <span
                      className={
                        isActive
                          ? "block text-xs text-emerald-50"
                          : "block text-xs text-slate-500 dark:text-slate-400"
                      }
                    >
                      {
                        option.description
                      }
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {section ===
        "internships" && (
        <div className="grid items-start gap-4 xl:grid-cols-2">
          <ReportMultiSelect
            id="report-program-filter"
            label="Carreras"
            options={(
              options?.academicPrograms ??
              []
            ).map(
              (
                academicProgram
              ) => ({
                value:
                  academicProgram.id,

                label:
                  academicProgram.name,
              })
            )}
            selection={
              filters.academicProgramIds
            }
            onChange={(
              academicProgramIds
            ) =>
              onChange({
                academicProgramIds,
              })
            }
            placeholder="Todas las carreras"
            helperText="Incluye varias carreras o excluye solamente las que no quieras comparar."
            searchPlaceholder="Buscar carrera..."
            disabled={isLoading}
          />

          <ReportMultiSelect
            id="report-level-filter"
            label="Niveles académicos"
            options={(
              options?.academicLevels ??
              []
            ).map((level) => ({
              value: level,
              label: level,
            }))}
            selection={
              filters.academicLevels
            }
            onChange={(
              academicLevels
            ) =>
              onChange({
                academicLevels,
              })
            }
            placeholder="Todos los niveles"
            helperText="Puedes combinar TSU, Licenciatura y registros sin nivel especificado."
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}

function getSectionActiveCount(
  section: ReportSection,
  filters: ReportFilters
): number {
  if (section === "waste") {
    return (
      filters.materials.values
        .length
    );
  }

  if (
    section === "human-capital"
  ) {
    return filters.personalTurn ===
      "all"
      ? 0
      : 1;
  }

  return (
    filters.academicProgramIds
      .values.length +
    filters.academicLevels.values
      .length
  );
}

function getSectionDescription(
  section: ReportSection
): string {
  if (section === "waste") {
    return "Afecta los indicadores, gráficas y resumen de materiales.";
  }

  if (
    section === "human-capital"
  ) {
    return "Cambia rápidamente entre ambos turnos o uno individual.";
  }

  return "Combina múltiples carreras y niveles académicos en los resultados.";
}