import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiActivity,
  FiBookOpen,
  FiCheckCircle,
  FiEdit2,
  FiFilter,
  FiInfo,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrendingUp,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import StatCard from "@/components/charts/StatCard";
import AcademicProgramForm from "@/components/forms/AcademicProgramForm";
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
import Switch from "@/components/ui/switch/Switch";
import { Table } from "@/components/ui/table";
import {
  useToast,
} from "@/components/ui/toast/toast";

import {
  usePagination,
} from "@/hooks/usePagination";

import {
  academicProgramsService,
} from "@/services/academicProgramsService";

import type {
  AcademicProgram,
} from "@/types/internshipParticipation";

type StatusFilter =
  | "all"
  | "active"
  | "inactive";

const statusOptions = [
  {
    value: "all",
    label: "Todos los estados",
  },
  {
    value: "active",
    label: "Activas",
  },
  {
    value: "inactive",
    label: "Inactivas",
  },
];

export default function AcademicProgramsSettings() {
  const confirm = useConfirmModal();
  const { toast } = useToast();

  const [
    academicPrograms,
    setAcademicPrograms,
  ] = useState<AcademicProgram[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>("all");

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingAcademicProgram,
    setEditingAcademicProgram,
  ] = useState<AcademicProgram | null>(
    null
  );

  const [
    changingAcademicProgramId,
    setChangingAcademicProgramId,
  ] = useState<string | null>(null);

  const formContainerRef =
    useRef<HTMLDivElement>(null);

  const loadAcademicPrograms =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await academicProgramsService.getAll();

        setAcademicPrograms(data);
      } catch (error) {
        console.error(
          "Error al cargar carreras:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar las carreras."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    let cancelled = false;

    academicProgramsService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setAcademicPrograms(data);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Error al cargar carreras:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar las carreras."
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
    editingAcademicProgram?.id,
  ]);

  const filteredAcademicPrograms =
    useMemo(() => {
      const normalizedSearch =
        normalizeSearch(search);

      return academicPrograms.filter(
        (academicProgram) => {
          const matchesSearch =
            !normalizedSearch ||
            normalizeSearch(
              academicProgram.name
            ).includes(
              normalizedSearch
            );

          const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active"
              ? academicProgram.active
              : !academicProgram.active);

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      academicPrograms,
      search,
      statusFilter,
    ]);

  const summary = useMemo(() => {
    const active =
      academicPrograms.filter(
        (academicProgram) =>
          academicProgram.active
      ).length;

    const total = academicPrograms.length;

    return {
      total,
      active,
      inactive: total - active,
      availability:
        total > 0
          ? (active / total) * 100
          : 0,
    };
  }, [academicPrograms]);

  const {
    currentPage,
    pageSize,
    totalItems,
    paginatedItems:
      paginatedAcademicPrograms,
    setCurrentPage,
    setPageSize,
    resetPage,
  } = usePagination(
    filteredAcademicPrograms
  );

  const filtersAreActive =
    Boolean(search.trim()) ||
    statusFilter !== "all";

  const handleOpenCreate = () => {
    setEditingAcademicProgram(null);
    setShowForm(true);
  };

  const handleOpenEdit = (
    academicProgram: AcademicProgram
  ) => {
    setEditingAcademicProgram(
      academicProgram
    );

    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingAcademicProgram(null);
    setShowForm(false);
  };

  const handleSaved = (
    savedAcademicProgram: AcademicProgram
  ) => {
    if (!editingAcademicProgram) {
      resetPage();
    }

    setAcademicPrograms((current) =>
      sortAcademicPrograms([
        ...current.filter(
          (academicProgram) =>
            academicProgram.id !==
            savedAcademicProgram.id
        ),
        savedAcademicProgram,
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

  const updateStatusFilter = (
    value: StatusFilter
  ) => {
    setStatusFilter(value);
    resetPage();
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    resetPage();
  };

  const handleStatusChange = async (
    academicProgram: AcademicProgram,
    nextActive: boolean
  ) => {
    if (
      changingAcademicProgramId !==
        null ||
      academicProgram.active ===
        nextActive
    ) {
      return;
    }

    if (!nextActive) {
      const confirmed = await confirm({
        title: "Desactivar carrera",

        description:
          `${academicProgram.name} dejará de aparecer al registrar Capital estadías. Sus registros históricos se conservarán.`,

        confirmText: "Desactivar",
        cancelText: "Cancelar",
        variant: "danger",
      });

      if (!confirmed) {
        return;
      }
    }

    try {
      setChangingAcademicProgramId(
        academicProgram.id
      );

      const updatedAcademicProgram =
        await academicProgramsService.setActive(
          academicProgram.id,
          nextActive
        );

      setAcademicPrograms((current) =>
        current.map(
          (currentAcademicProgram) =>
            currentAcademicProgram.id ===
            updatedAcademicProgram.id
              ? updatedAcademicProgram
              : currentAcademicProgram
        )
      );

      toast.success({
        title: nextActive
          ? "Carrera activada"
          : "Carrera desactivada",

        description:
          `${academicProgram.name} fue actualizada correctamente.`,
      });
    } catch (error) {
      console.error(
        "Error al cambiar el estado de la carrera:",
        error
      );

      toast.error({
        title:
          "No se pudo actualizar la carrera",

        description:
          getErrorMessage(error),
      });
    } finally {
      setChangingAcademicProgramId(
        null
      );
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
          className="absolute inset-y-0 left-0 w-1 bg-violet-500"
        />

        <Card.Body className="p-5 pl-6 sm:p-6 sm:pl-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xl text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                <FiBookOpen
                  aria-hidden="true"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Carreras
                  </h2>

                  <Badge variant="secondary">
                    Catálogo académico
                  </Badge>
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Administra las carreras
                  disponibles para registrar
                  la participación de Capital
                  estadías.
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
                  void loadAcademicPrograms()
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
                  Nueva carrera
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/30">
            <FiInfo
              className="mt-0.5 shrink-0 text-sky-700 dark:text-sky-300"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">
                Conservación de datos
                históricos
              </p>

              <p className="mt-1 text-sm leading-6 text-sky-700 dark:text-sky-400">
                Las carreras no se eliminan.
                Al desactivar una dejará de
                aparecer en nuevos registros,
                pero seguirá disponible en el
                historial y los reportes.
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
          <AcademicProgramForm
            key={
              editingAcademicProgram?.id ??
              "new-academic-program"
            }
            initialAcademicProgram={
              editingAcademicProgram
            }
            onSaved={handleSaved}
            onCancel={handleCloseForm}
          />
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Carreras registradas"
          value={summary.total}
          isLoading={loading}
          accent="violet"
          decimals={0}
          icon={
            <FiBookOpen
              aria-hidden="true"
            />
          }
          helper="Total del catálogo académico"
        />

        <StatCard
          label="Carreras activas"
          value={summary.active}
          isLoading={loading}
          accent="emerald"
          decimals={0}
          icon={
            <FiCheckCircle
              aria-hidden="true"
            />
          }
          helper="Disponibles en Capital estadías"
        />

        <StatCard
          label="Carreras inactivas"
          value={summary.inactive}
          isLoading={loading}
          accent="amber"
          decimals={0}
          icon={
            <FiXCircle
              aria-hidden="true"
            />
          }
          helper="Ocultas sin perder su historial"
        />

        <StatCard
          label="Disponibilidad"
          value={summary.availability}
          unit="%"
          isLoading={loading}
          accent="sky"
          decimals={0}
          icon={
            <FiTrendingUp
              aria-hidden="true"
            />
          }
          helper="Porcentaje del catálogo activo"
        />
      </section>

      <Card variant="outlined">
        <Card.Header className="flex-row items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              <FiFilter aria-hidden="true" />
            </span>

            <div>
              <Card.Title>
                Buscar y filtrar
              </Card.Title>

              <Card.Description className="mt-1">
                Encuentra carreras por nombre
                o estado de disponibilidad.
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

        <Card.Body className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <Input
            id="academic-programs-search"
            name="academicProgramsSearch"
            aria-label="Buscar carreras"
            placeholder="Buscar por nombre..."
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
            id="academic-programs-status-filter"
            options={statusOptions}
            value={statusFilter}
            onChange={(value) =>
              updateStatusFilter(
                value as StatusFilter
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
                void loadAcademicPrograms()
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
              Catálogo de carreras
            </Card.Title>

            <Card.Description className="mt-1">
              Carreras utilizadas para
              clasificar los registros de
              Capital estadías.
            </Card.Description>
          </div>

          <Badge variant="secondary">
            {filteredAcademicPrograms.length.toLocaleString(
              "es-MX"
            )}
            {filteredAcademicPrograms.length === 1
              ? " resultado"
              : " resultados"}
          </Badge>
        </Card.Header>

        <Table className="rounded-none border-x-0 border-b-0 border-t-0">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>
                Carrera
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
                  <Table.Cell>
                    <Skeleton
                      variant="text"
                      className="w-40"
                    />
                  </Table.Cell>

                  <Table.Cell>
                    <Skeleton
                      variant="text"
                      className="w-28"
                    />
                  </Table.Cell>

                  <Table.Cell>
                    <Skeleton
                      variant="text"
                      className="w-28"
                    />
                  </Table.Cell>

                  <Table.Cell align="right">
                    <Skeleton
                      variant="text"
                      className="ml-auto w-20"
                    />
                  </Table.Cell>
                </Table.Row>
              ))}

            {!loading &&
              !errorMessage &&
              filteredAcademicPrograms
                .length === 0 && (
                <Table.Empty
                  colSpan={4}
                  icon={
                    <FiBookOpen
                      size={30}
                    />
                  }
                  title="No se encontraron carreras"
                  description="Prueba cambiando la búsqueda o el filtro seleccionado."
                />
              )}

            {!loading &&
              !errorMessage &&
              paginatedAcademicPrograms.map(
                (academicProgram) => {
                  const operationsLocked =
                    changingAcademicProgramId !==
                    null;

                  return (
                    <Table.Row
                      key={
                        academicProgram.id
                      }
                      clickable
                    >
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                            <FiBookOpen
                              aria-hidden="true"
                            />
                          </span>

                          <p className="font-medium text-slate-800 dark:text-white">
                            {
                              academicProgram.name
                            }
                          </p>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="min-w-44">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={
                              academicProgram.active
                            }
                            disabled={
                              operationsLocked
                            }
                            onChange={(checked) =>
                              void handleStatusChange(
                                academicProgram,
                                checked
                              )
                            }
                          />

                          <Badge
                            variant={
                              academicProgram.active
                                ? "success"
                                : "danger"
                            }
                            dot
                          >
                            {academicProgram.active
                              ? "Activa"
                              : "Inactiva"}
                          </Badge>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap">
                        {formatDate(
                          academicProgram.createdAt
                        )}
                      </Table.Cell>

                      <Table.Cell align="right">
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
                              academicProgram
                            )
                          }
                          disabled={
                            operationsLocked
                          }
                        >
                          Editar
                        </Button>
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
          Las carreras no se eliminan.
          Desactívalas para ocultarlas del
          formulario de Capital estadías sin
          perder los registros históricos que
          ya estén relacionados con ellas.
        </p>
      </div>
    </div>
  );
}

function sortAcademicPrograms(
  academicPrograms: AcademicProgram[]
): AcademicProgram[] {
  return [...academicPrograms].sort(
    (a, b) =>
      a.name.localeCompare(
        b.name,
        "es"
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