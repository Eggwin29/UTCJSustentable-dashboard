import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";

import AcademicTermForm from "@/components/forms/AcademicTermForm";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";

import {
  useConfirmModal,
} from "@/components/ui/confirm-modal";

import Skeleton from "@/components/ui/skeleton/Skeleton";
import { Table } from "@/components/ui/table";

import {
  useToast,
} from "@/components/ui/toast/toast";

import {
  academicTermsService,
} from "@/services/academicTermsService";

import type {
  AcademicTerm,
} from "@/types/academicTerm";

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
        if (!cancelled) {
          console.error(
            "Error al cargar cuatrimestres:",
            error
          );

          setErrorMessage(
            "No se pudieron cargar los cuatrimestres."
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

  const yearsCount = useMemo(
    () =>
      new Set(
        academicTerms.map(
          (academicTerm) =>
            academicTerm.year
        )
      ).size,
    [academicTerms]
  );

  const currentAcademicTerm =
    academicTerms.find(
      (academicTerm) =>
        academicTerm.isCurrent
    ) ?? null;

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
        `${academicTerm.label} será el cuatrimestre predeterminado para los nuevos registros.`,

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
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Cuatrimestres
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administra los periodos
            académicos y selecciona cuál
            está en curso.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            leftIcon={
              <FiRefreshCw />
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
              leftIcon={<FiPlus />}
              onClick={handleOpenCreate}
            >
              Nuevo cuatrimestre
            </Button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Un solo cuatrimestre actual
        </p>

        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
          El periodo actual será la
          selección predeterminada al
          registrar nuevas recolecciones.
          Puedes cambiarlo manualmente
          cuando comience el siguiente.
        </p>
      </section>

      {showForm && (
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
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Cuatrimestres registrados"
          value={academicTerms.length}
        />

        <SummaryCard
          label="Años registrados"
          value={yearsCount}
        />

        <SummaryCard
          label="Cuatrimestre actual"
          value={
            currentAcademicTerm
              ?.label ?? "Sin definir"
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
              void loadAcademicTerms()
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
            academicTerms.length ===
              0 && (
              <Table.Empty
                colSpan={5}
                icon={
                  <FiCalendar
                    size={30}
                  />
                }
                title="No hay cuatrimestres registrados"
                description="Crea el primer periodo académico para comenzar."
              />
            )}

          {!loading &&
            !errorMessage &&
            academicTerms.map(
              (academicTerm) => {
                const operationsLocked =
                  changingCurrentId !==
                  null;

                return (
                  <Table.Row
                    key={academicTerm.id}
                  >
                    <Table.Cell>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {
                          academicTerm.label
                        }
                      </p>
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
                            size="sm"
                            variant="ghost"
                            leftIcon={
                              <FiCheckCircle />
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
                          size="sm"
                          variant="ghost"
                          leftIcon={
                            <FiEdit2 />
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

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Los cuatrimestres no se
        eliminan para conservar la
        relación con los registros
        históricos.
      </p>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number | string;
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

      <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
        {value}
      </p>
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