import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiFilter,
  FiGrid,
  FiInfo,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";

import StatCard from "@/components/charts/StatCard";
import AcademicTermForm from "@/components/forms/AcademicTermForm";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useConfirmModal,
} from "@/components/ui/confirm-modal";
import Input from "@/components/ui/input/Input";
import Pagination from "@/components/ui/pagination";
import Dropdown from "@/components/ui/select";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import { Table } from "@/components/ui/table";
import {
  useToast,
} from "@/components/ui/toast/toast";

import {
  usePagination,
} from "@/hooks/usePagination";

import {
  academicTermsService,
} from "@/services/academicTermsService";

import type {
  AcademicTerm,
  AcademicTermCode,
} from "@/types/academicTerm";

type TermFilter =
  | "all"
  | AcademicTermCode;

type CurrentFilter =
  | "all"
  | "current"
  | "not-current";

const termOptions = [
  {
    value: "all",
    label: "Todos los periodos",
  },
  {
    value: "E-A",
    label: "Enero - Abril",
  },
  {
    value: "M-A",
    label: "Mayo - Agosto",
  },
  {
    value: "S-D",
    label: "Septiembre - Diciembre",
  },
];

const currentOptions = [
  {
    value: "all",
    label: "Todos los estados",
  },
  {
    value: "current",
    label: "Solo el actual",
  },
  {
    value: "not-current",
    label: "Solo no actuales",
  },
];

export default function AcademicTermsSettings() {
  const confirm = useConfirmModal();
  const { toast } = useToast();

  const [
    academicTerms,
    setAcademicTerms,
  ] = useState<AcademicTerm[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [search, setSearch] =
    useState("");

  const [yearFilter, setYearFilter] =
    useState("all");

  const [termFilter, setTermFilter] =
    useState<TermFilter>("all");

  const [
    currentFilter,
    setCurrentFilter,
  ] = useState<CurrentFilter>("all");

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingAcademicTerm,
    setEditingAcademicTerm,
  ] = useState<AcademicTerm | null>(
    null
  );

  const [
    changingCurrentId,
    setChangingCurrentId,
  ] = useState<string | null>(null);

  const formContainerRef =
    useRef<HTMLDivElement>(null);

  const loadAcademicTerms =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await academicTermsService.getAll();

        setAcademicTerms(data);
      } catch (error) {
        console.error(
          "Error al cargar cuatrimestres:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar los cuatrimestres."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    let cancelled = false;

    academicTermsService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setAcademicTerms(data);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Error al cargar cuatrimestres:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar los cuatrimestres."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!showForm) {
      return;
    }

    const animationFrame =
      window.requestAnimationFrame(
        () => {
          formContainerRef.current
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }
      );

    return () => {
      window.cancelAnimationFrame(
        animationFrame
      );
    };
  }, [
    showForm,
    editingAcademicTerm?.id,
  ]);

  const currentAcademicTerm =
    useMemo(
      () =>
        academicTerms.find(
          (academicTerm) =>
            academicTerm.isCurrent
        ) ?? null,
      [academicTerms]
    );

  const yearOptions = useMemo(
    () => [
      {
        value: "all",
        label: "Todos los años",
      },
      ...Array.from(
        new Set(
          academicTerms.map(
            (academicTerm) =>
              academicTerm.year
          )
        )
      )
        .sort((a, b) => b - a)
        .map((year) => ({
          value: String(year),
          label: String(year),
        })),
    ],
    [academicTerms]
  );

  const filteredAcademicTerms =
    useMemo(() => {
      const normalizedSearch =
        normalizeSearch(search);

      return academicTerms.filter(
        (academicTerm) => {
          const searchableText =
            normalizeSearch(
              `${academicTerm.label} ${getTermName(
                academicTerm.term
              )} ${academicTerm.year}`
            );

          const matchesSearch =
            !normalizedSearch ||
            searchableText.includes(
              normalizedSearch
            );

          const matchesYear =
            yearFilter === "all" ||
            academicTerm.year ===
              Number(yearFilter);

          const matchesTerm =
            termFilter === "all" ||
            academicTerm.term ===
              termFilter;

          const matchesCurrent =
            currentFilter === "all" ||
            (currentFilter === "current"
              ? academicTerm.isCurrent
              : !academicTerm.isCurrent);

          return (
            matchesSearch &&
            matchesYear &&
            matchesTerm &&
            matchesCurrent
          );
        }
      );
    }, [
      academicTerms,
      currentFilter,
      search,
      termFilter,
      yearFilter,
    ]);

  const summary = useMemo(() => {
    const years = new Set(
      academicTerms.map(
        (academicTerm) =>
          academicTerm.year
      )
    ).size;

    const systemYear =
      new Date().getFullYear();

    const termsThisYear =
      academicTerms.filter(
        (academicTerm) =>
          academicTerm.year ===
          systemYear
      ).length;

    return {
      total: academicTerms.length,
      years,
      termsThisYear,
      systemYear,
    };
  }, [academicTerms]);

  const {
    currentPage,
    pageSize,
    totalItems,
    paginatedItems:
      paginatedAcademicTerms,
    setCurrentPage,
    setPageSize,
    resetPage,
  } = usePagination(
    filteredAcademicTerms
  );

  const filtersAreActive =
    Boolean(search.trim()) ||
    yearFilter !== "all" ||
    termFilter !== "all" ||
    currentFilter !== "all";

  const handleOpenCreate = () => {
    setEditingAcademicTerm(null);
    setShowForm(true);
  };

  const handleOpenEdit = (
    academicTerm: AcademicTerm
  ) => {
    setEditingAcademicTerm(
      academicTerm
    );

    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingAcademicTerm(null);
    setShowForm(false);
  };

  const handleSaved = (
    savedAcademicTerm: AcademicTerm
  ) => {
    if (!editingAcademicTerm) {
      resetPage();
    }

    setAcademicTerms((current) =>
      sortAcademicTerms([
        ...current.filter(
          (academicTerm) =>
            academicTerm.id !==
            savedAcademicTerm.id
        ),
        savedAcademicTerm,
      ])
    );

    handleCloseForm();
  };

  const updateSearch = (
    value: string
  ) => {
    setSearch(value);
    resetPage();
  };

  const updateYearFilter = (
    value: string
  ) => {
    setYearFilter(value);
    resetPage();
  };

  const updateTermFilter = (
    value: TermFilter
  ) => {
    setTermFilter(value);
    resetPage();
  };

  const updateCurrentFilter = (
    value: CurrentFilter
  ) => {
    setCurrentFilter(value);
    resetPage();
  };

  const clearFilters = () => {
    setSearch("");
    setYearFilter("all");
    setTermFilter("all");
    setCurrentFilter("all");
    resetPage();
  };

  const handleSetCurrent = async (
    academicTerm: AcademicTerm
  ) => {
    if (
      academicTerm.isCurrent ||
      changingCurrentId !== null
    ) {
      return;
    }

    const confirmed = await confirm({
      title:
        "Cambiar cuatrimestre actual",

      description:
        `${academicTerm.label} será el cuatrimestre predeterminado para los nuevos registros. El periodo actual anterior conservará todos sus datos históricos.`,

      confirmText:
        "Marcar como actual",

      cancelText: "Cancelar",
      variant: "default",
    });

    if (!confirmed) {
      return;
    }

    try {
      setChangingCurrentId(
        academicTerm.id
      );

      const updatedAcademicTerm =
        await academicTermsService.setCurrent(
          academicTerm.id
        );

      setAcademicTerms((current) =>
        current.map(
          (currentTerm) => ({
            ...currentTerm,

            isCurrent:
              currentTerm.id ===
              updatedAcademicTerm.id,
          })
        )
      );

      toast.success({
        title:
          "Cuatrimestre actual actualizado",

        description:
          `${updatedAcademicTerm.label} quedó seleccionado como actual.`,
      });
    } catch (error) {
      console.error(
        "Error al cambiar el cuatrimestre actual:",
        error
      );

      toast.error({
        title:
          "No se pudo cambiar el cuatrimestre actual",

        description:
          getErrorMessage(error),
      });
    } finally {
      setChangingCurrentId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        variant="outlined"
        className="relative overflow-hidden"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-amber-500"
        />

        <Card.Body className="p-5 pl-6 sm:p-6 sm:pl-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <FiCalendar
                  aria-hidden="true"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Cuatrimestres
                  </h2>

                  <Badge variant="warning">
                    Calendario académico
                  </Badge>
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Administra los periodos
                  académicos, sus fechas y el
                  cuatrimestre que se encuentra
                  actualmente en curso.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                leftIcon={
                  <FiRefreshCw
                    aria-hidden="true"
                  />
                }
                onClick={() =>
                  void loadAcademicTerms()
                }
                loading={loading}
              >
                Actualizar
              </Button>

              {!showForm && (
                <Button
                  leftIcon={
                    <FiPlus
                      aria-hidden="true"
                    />
                  }
                  onClick={handleOpenCreate}
                >
                  Nuevo cuatrimestre
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <FiInfo
              className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-300"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Un solo cuatrimestre actual
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-400">
                Este periodo será la selección
                predeterminada en los nuevos
                registros. Al cambiarlo, el
                anterior conservará todas sus
                relaciones históricas.
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {showForm && (
        <div
          ref={formContainerRef}
          className="scroll-mt-28"
        >
          <AcademicTermForm
            key={
              editingAcademicTerm?.id ??
              "new-academic-term"
            }
            initialAcademicTerm={
              editingAcademicTerm
            }
            onSaved={handleSaved}
            onCancel={handleCloseForm}
          />
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Cuatrimestres registrados"
          value={summary.total}
          isLoading={loading}
          accent="amber"
          decimals={0}
          icon={
            <FiCalendar
              aria-hidden="true"
            />
          }
          helper="Total del calendario académico"
        />

        <StatCard
          label="Años registrados"
          value={summary.years}
          isLoading={loading}
          accent="sky"
          decimals={0}
          icon={
            <FiGrid aria-hidden="true" />
          }
          helper="Cobertura histórica disponible"
        />

        <StatCard
          label={`Periodos de ${summary.systemYear}`}
          value={summary.termsThisYear}
          isLoading={loading}
          accent="violet"
          decimals={0}
          icon={
            <FiClock aria-hidden="true" />
          }
          helper="Cuatrimestres configurados este año"
        />

        <CurrentAcademicTermCard
          academicTerm={
            currentAcademicTerm
          }
          isLoading={loading}
        />
      </section>

      <Card variant="outlined">
        <Card.Header className="flex-row items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <FiFilter aria-hidden="true" />
            </span>

            <div>
              <Card.Title>
                Buscar y filtrar
              </Card.Title>

              <Card.Description className="mt-1">
                Localiza periodos por nombre,
                año, cuatrimestre o estado.
              </Card.Description>
            </div>
          </div>

          {filtersAreActive && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              leftIcon={
                <FiX aria-hidden="true" />
              }
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </Card.Header>

        <Card.Body className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_170px_210px_190px]">
          <Input
            id="academic-terms-search"
            name="academicTermsSearch"
            aria-label="Buscar cuatrimestres"
            placeholder="Buscar periodo o año..."
            leftIcon={
              <FiSearch
                aria-hidden="true"
              />
            }
            clearable
            value={search}
            onChange={(event) =>
              updateSearch(
                event.target.value
              )
            }
          />

          <Dropdown
            id="academic-terms-year-filter"
            options={yearOptions}
            value={yearFilter}
            onChange={(value) =>
              updateYearFilter(
                String(value)
              )
            }
          />

          <Dropdown
            id="academic-terms-period-filter"
            options={termOptions}
            value={termFilter}
            onChange={(value) =>
              updateTermFilter(
                value as TermFilter
              )
            }
          />

          <Dropdown
            id="academic-terms-current-filter"
            options={currentOptions}
            value={currentFilter}
            onChange={(value) =>
              updateCurrentFilter(
                value as CurrentFilter
              )
            }
          />
        </Card.Body>
      </Card>

      {errorMessage && (
        <Card
          variant="outlined"
          className="border-red-200 dark:border-red-900"
        >
          <Card.Body className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <FiActivity
                className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {errorMessage}
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Verifica la conexión con
                  Supabase e inténtalo de
                  nuevo.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void loadAcademicTerms()
              }
            >
              Reintentar
            </Button>
          </Card.Body>
        </Card>
      )}

      <Card variant="outlined">
        <Card.Header className="flex-row items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div>
            <Card.Title>
              Calendario de cuatrimestres
            </Card.Title>

            <Card.Description className="mt-1">
              Periodos utilizados para agrupar
              colecciones, participación y
              reportes.
            </Card.Description>
          </div>

          <Badge variant="secondary">
            {filteredAcademicTerms.length.toLocaleString(
              "es-MX"
            )}

            {filteredAcademicTerms.length === 1
              ? " resultado"
              : " resultados"}
          </Badge>
        </Card.Header>

        <Table className="rounded-none border-x-0 border-b-0 border-t-0">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>
                Cuatrimestre
              </Table.HeaderCell>

              <Table.HeaderCell>
                Periodo
              </Table.HeaderCell>

              <Table.HeaderCell>
                Estado
              </Table.HeaderCell>

              <Table.HeaderCell>
                Registro
              </Table.HeaderCell>

              <Table.HeaderCell align="right">
                Acciones
              </Table.HeaderCell>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {loading &&
              Array.from({
                length: 5,
              }).map((_, index) => (
                <Table.Row key={index}>
                  {Array.from({
                    length: 5,
                  }).map(
                    (__, cellIndex) => (
                      <Table.Cell
                        key={cellIndex}
                        align={
                          cellIndex === 4
                            ? "right"
                            : "left"
                        }
                      >
                        <Skeleton
                          variant="text"
                          className={
                            cellIndex === 4
                              ? "ml-auto w-28"
                              : "w-28"
                          }
                        />
                      </Table.Cell>
                    )
                  )}
                </Table.Row>
              ))}

            {!loading &&
              !errorMessage &&
              filteredAcademicTerms.length ===
                0 && (
                <Table.Empty
                  colSpan={5}
                  icon={
                    <FiCalendar
                      size={30}
                    />
                  }
                  title="No se encontraron cuatrimestres"
                  description={
                    academicTerms.length === 0
                      ? "Crea el primer periodo académico para comenzar."
                      : "Prueba cambiando la búsqueda o los filtros seleccionados."
                  }
                />
              )}

            {!loading &&
              !errorMessage &&
              paginatedAcademicTerms.map(
                (academicTerm) => {
                  const operationsLocked =
                    changingCurrentId !==
                    null;

                  return (
                    <Table.Row
                      key={academicTerm.id}
                      clickable
                      className={
                        academicTerm.isCurrent
                          ? "bg-emerald-50/60 dark:bg-emerald-950/15"
                          : undefined
                      }
                    >
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <span
                            className={
                              academicTerm.isCurrent
                                ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            }
                          >
                            <FiCalendar
                              aria-hidden="true"
                            />
                          </span>

                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">
                              {
                                academicTerm.label
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {getTermName(
                                academicTerm.term
                              )}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap">
                        {formatDateRange(
                          academicTerm.startDate,
                          academicTerm.endDate
                        )}
                      </Table.Cell>

                      <Table.Cell>
                        <Badge
                          variant={
                            academicTerm.isCurrent
                              ? "success"
                              : "secondary"
                          }
                          dot={
                            academicTerm.isCurrent
                          }
                        >
                          {academicTerm.isCurrent
                            ? "Actual"
                            : "Registrado"}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap">
                        {formatDate(
                          academicTerm.createdAt
                        )}
                      </Table.Cell>

                      <Table.Cell align="right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {!academicTerm.isCurrent && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              leftIcon={
                                <FiCheckCircle
                                  aria-hidden="true"
                                />
                              }
                              onClick={() =>
                                void handleSetCurrent(
                                  academicTerm
                                )
                              }
                              loading={
                                changingCurrentId ===
                                academicTerm.id
                              }
                              disabled={
                                operationsLocked
                              }
                            >
                              Marcar actual
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            leftIcon={
                              <FiEdit2
                                aria-hidden="true"
                              />
                            }
                            onClick={() =>
                              handleOpenEdit(
                                academicTerm
                              )
                            }
                            disabled={
                              operationsLocked
                            }
                          >
                            Editar
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                }
              )}
          </Table.Body>
        </Table>

        {!loading && !errorMessage && (
          <Card.Body className="border-t border-slate-100 p-4 dark:border-slate-800">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              className="mt-0 border-0 bg-slate-50 shadow-none dark:bg-slate-950/40"
            />
          </Card.Body>
        )}
      </Card>

      <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <FiInfo
          className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400"
          aria-hidden="true"
        />

        <p className="text-xs leading-5">
          Los cuatrimestres no se eliminan para
          conservar su relación con los
          registros históricos. Edita sus
          fechas únicamente para corregir el
          calendario académico.
        </p>
      </div>
    </div>
  );
}

interface CurrentAcademicTermCardProps {
  academicTerm: AcademicTerm | null;
  isLoading: boolean;
}

function CurrentAcademicTermCard({
  academicTerm,
  isLoading,
}: CurrentAcademicTermCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-emerald-500"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Cuatrimestre actual
          </p>

          {isLoading ? (
            <Skeleton className="mt-3 h-8 w-32" />
          ) : (
            <p className="mt-2 truncate text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {academicTerm?.label ??
                "Sin definir"}
            </p>
          )}
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <FiCheckCircle
            aria-hidden="true"
          />
        </span>
      </div>

      {!isLoading && (
        <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {academicTerm
            ? formatDateRange(
                academicTerm.startDate,
                academicTerm.endDate
              )
            : "Selecciona un periodo para usarlo en nuevos registros."}
        </p>
      )}
    </div>
  );
}

function sortAcademicTerms(
  academicTerms: AcademicTerm[]
): AcademicTerm[] {
  return [...academicTerms].sort(
    (a, b) =>
      b.startDate.localeCompare(
        a.startDate
      )
  );
}

function normalizeSearch(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getTermName(
  term: AcademicTermCode
): string {
  if (term === "E-A") {
    return "Enero - Abril";
  }

  if (term === "M-A") {
    return "Mayo - Agosto";
  }

  return "Septiembre - Diciembre";
}

function formatDateRange(
  startDate: string,
  endDate: string
): string {
  return `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`;
}

function formatShortDate(
  date: string
): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(
    new Date(`${date}T00:00:00Z`)
  );
}

function formatDate(
  date: string
): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(date));
}

function getErrorMessage(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Inténtalo nuevamente.";
}