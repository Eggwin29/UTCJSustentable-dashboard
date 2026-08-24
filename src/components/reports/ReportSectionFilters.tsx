import { useState } from "react";

import {
  FiChevronDown,
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
  const [isOpen, setIsOpen] =
    useState(false);

  const activeCount =
    getSectionActiveCount(
      section,
      filters
    );

  const contentId =
    `report-${section}-filter-content`;

  const sectionSummary =
    getSectionSummary(
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
    <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/40">
      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={() =>
            setIsOpen(
              (current) => !current
            )
          }
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          <span className="shrink-0 rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <FiFilter
              className="h-4 w-4"
              aria-hidden="true"
            />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Filtros de esta sección
            </span>

            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              {sectionSummary}
            </span>
          </span>

          <span
            className={
              activeCount > 0
                ? "hidden shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex dark:bg-emerald-500/10 dark:text-emerald-400"
                : "hidden shrink-0 rounded-full bg-slate-200/70 px-2.5 py-1 text-xs font-medium text-slate-600 sm:inline-flex dark:bg-slate-800 dark:text-slate-300"
            }
          >
            {activeCount > 0
              ? `${activeCount} ${
                  activeCount === 1
                    ? "activo"
                    : "activos"
                }`
              : "Sin filtros"}
          </span>

          <FiChevronDown
            className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-hover:text-emerald-700 dark:text-slate-400 dark:group-hover:text-emerald-400 ${
              isOpen
                ? "rotate-180"
                : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {activeCount > 0 && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            leftIcon={<FiX />}
            onClick={resetSection}
            className="sm:ml-2"
          >
            {section === "waste"
              ? "Limpiar materiales"
              : "Limpiar sección"}
          </Button>
        )}
      </div>

      {isOpen && (
        <div
          id={contentId}
          className="border-t border-slate-200 p-4 dark:border-slate-700"
        >
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            {getSectionDescription(
              section
            )}
          </p>

          {section === "waste" && (
            <ReportMultiSelect
              id="report-material-filter"
              label="Materiales"
              options={(
                options?.materials ??
                []
              ).map(
                (material) => ({
                  value: material,
                  label: material,
                })
              )}
              selection={
                filters.materials
              }
              onChange={(
                materials
              ) =>
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
                        key={
                          option.value
                        }
                        type="button"
                        aria-pressed={
                          isActive
                        }
                        disabled={
                          isLoading
                        }
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
                  options
                    ?.academicPrograms ??
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
                  options
                    ?.academicLevels ??
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
      )}
    </div>
  );
}

function getSectionSummary(
  section: ReportSection,
  filters: ReportFilters
): string {
  if (section === "waste") {
    const materialCount =
      filters.materials.values
        .length;

    if (materialCount === 0) {
      return "Todos los materiales";
    }

    const action =
      filters.materials.mode ===
      "exclude"
        ? materialCount === 1
          ? "excluido"
          : "excluidos"
        : materialCount === 1
          ? "incluido"
          : "incluidos";

    return `${materialCount} ${
      materialCount === 1
        ? "material"
        : "materiales"
    } ${action}`;
  }

  if (
    section === "human-capital"
  ) {
    if (
      filters.personalTurn === "tm"
    ) {
      return "Solo TM Martes";
    }

    if (
      filters.personalTurn === "tv"
    ) {
      return "Solo TV Jueves";
    }

    return "Ambos turnos";
  }

  const programCount =
    filters.academicProgramIds
      .values.length;

  const levelCount =
    filters.academicLevels.values
      .length;

  if (
    programCount === 0 &&
    levelCount === 0
  ) {
    return "Todas las carreras y niveles académicos";
  }

  const summaries: string[] = [];

  if (programCount > 0) {
    summaries.push(
      `${programCount} ${
        programCount === 1
          ? "carrera"
          : "carreras"
      } ${
        filters.academicProgramIds
          .mode === "exclude"
          ? programCount === 1
            ? "excluida"
            : "excluidas"
          : programCount === 1
            ? "incluida"
            : "incluidas"
      }`
    );
  }

  if (levelCount > 0) {
    summaries.push(
      `${levelCount} ${
        levelCount === 1
          ? "nivel"
          : "niveles"
      } ${
        filters.academicLevels
          .mode === "exclude"
          ? levelCount === 1
            ? "excluido"
            : "excluidos"
          : levelCount === 1
            ? "incluido"
            : "incluidos"
      }`
    );
  }

  return summaries.join(" · ");
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