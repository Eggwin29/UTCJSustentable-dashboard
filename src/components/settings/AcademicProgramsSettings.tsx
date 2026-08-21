import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiBookOpen,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import AcademicProgramForm from "@/components/forms/AcademicProgramForm";

import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import {
  useConfirmModal,
} from "@/components/ui/confirm-modal";
import Input from "@/components/ui/input/Input";
import Dropdown from "@/components/ui/select";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import Switch from "@/components/ui/switch/Switch";
import { Table } from "@/components/ui/table";
import {
  useToast,
} from "@/components/ui/toast/toast";

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
        if (!cancelled) {
          console.error(
            "Error al cargar carreras:",
            error
          );

          setErrorMessage(
            "No se pudieron cargar las carreras."
          );
        }
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

  const filteredAcademicPrograms =
    useMemo(() => {
      const normalizedSearch = search
        .trim()
        .toLocaleLowerCase("es");

      return academicPrograms.filter(
        (academicProgram) => {
          const matchesSearch =
            !normalizedSearch ||
            academicProgram.name
              .toLocaleLowerCase("es")
              .includes(
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

  const activeAcademicPrograms =
    academicPrograms.filter(
      (academicProgram) =>
        academicProgram.active
    ).length;

  const inactiveAcademicPrograms =
    academicPrograms.length -
    activeAcademicPrograms;

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
      const confirmed =
        await confirm({
          title: "Desactivar carrera",

          description: `${academicProgram.name} dejará de aparecer al registrar Capital estadías. Sus registros históricos se conservarán.`,

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

        description: `${academicProgram.name} fue actualizada correctamente.`,
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
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Carreras
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administra las carreras disponibles en Capital estadías.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            leftIcon={<FiRefreshCw />}
            onClick={() =>
              void loadAcademicPrograms()
            }
            loading={loading}
          >
            Actualizar
          </Button>

          {!showForm && (
            <Button
              leftIcon={<FiPlus />}
              onClick={handleOpenCreate}
            >
              Nueva carrera
            </Button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/30">
        <p className="text-sm font-medium text-sky-800 dark:text-sky-300">
          Conservación de datos históricos
        </p>

        <p className="mt-1 text-sm text-sky-700 dark:text-sky-400">
          Las carreras no se eliminan. Al desactivar una carrera dejará de aparecer en nuevos registros, pero seguirá visible en el historial y los reportes.
        </p>
      </section>

      {showForm && (
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
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Carreras registradas"
          value={
            academicPrograms.length
          }
        />

        <SummaryCard
          label="Carreras activas"
          value={
            activeAcademicPrograms
          }
        />

        <SummaryCard
          label="Carreras inactivas"
          value={
            inactiveAcademicPrograms
          }
        />
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-[minmax(0,1fr)_220px]">
        <Input
          id="academic-program-search"
          name="academicProgramSearch"
          aria-label="Buscar carreras"
          placeholder="Buscar carrera..."
          leftIcon={<FiSearch />}
          clearable
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        <Dropdown
          options={statusOptions}
          value={statusFilter}
          onChange={(value) =>
            setStatusFilter(
              value as StatusFilter
            )
          }
        />
      </section>

      {errorMessage && (
        <section className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/60 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">
            {errorMessage}
          </p>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              void loadAcademicPrograms()
            }
          >
            Reintentar
          </Button>
        </section>
      )}

      <Table>
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
            filteredAcademicPrograms.map(
              (academicProgram) => {
                const operationsLocked =
                  changingAcademicProgramId !==
                  null;

                return (
                  <Table.Row
                    key={
                      academicProgram.id
                    }
                  >
                    <Table.Cell>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {
                          academicProgram.name
                        }
                      </p>
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
                          onChange={(
                            checked
                          ) =>
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
                        size="sm"
                        variant="ghost"
                        leftIcon={
                          <FiEdit2 />
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

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Desactiva una carrera para ocultarla del formulario de Capital estadías sin perder sus registros históricos.
      </p>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
}

function SummaryCard({
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">
        {value}
      </p>
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