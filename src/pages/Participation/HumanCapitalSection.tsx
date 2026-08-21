import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef
} from "react";

import {
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";

import HumanCapitalForm from "@/components/forms/HumanCapitalForm";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import { Table } from "@/components/ui/table";

import {
  useAuth,
} from "@/context/auth/useAuth";

import {
  academicTermsService,
} from "@/services/academicTermsService";

import {
  humanCapitalService,
} from "@/services/humanCapitalService";

import type {
  AcademicTerm,
  AcademicTermCode,
} from "@/types/academicTerm";

import type {
  HumanCapitalRecord,
} from "@/types/humanCapital";

export default function HumanCapitalSection() {
  const { profile } = useAuth();

  const canManage =
    profile?.active === true &&
    profile.role === "admin";

  const [
    records,
    setRecords,
  ] =
    useState<HumanCapitalRecord[]>(
      []
    );

  const [
    academicTerms,
    setAcademicTerms,
  ] =
    useState<AcademicTerm[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingRecord,
    setEditingRecord,
  ] =
    useState<HumanCapitalRecord | null>(
      null
    );
    const formContainerRef =
  useRef<HTMLDivElement>(null);

  const loadData =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const [
          recordsData,
          termsData,
        ] = await Promise.all([
          humanCapitalService.getAll(),

          academicTermsService.getAll(),
        ]);

        setRecords(
          sortHumanCapitalRecords(
            recordsData
          )
        );

        setAcademicTerms(
          termsData
        );
      } catch (error) {
        console.error(
          "Error al cargar Capital humano:",
          error
        );

        setErrorMessage(
          "No se pudo cargar la información de Capital humano."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      humanCapitalService.getAll(),

      academicTermsService.getAll(),
    ])
      .then(
        ([
          recordsData,
          termsData,
        ]) => {
          if (cancelled) {
            return;
          }

          setRecords(
            sortHumanCapitalRecords(
              recordsData
            )
          );

          setAcademicTerms(
            termsData
          );
        }
      )
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Error al cargar Capital humano:",
          error
        );

        setErrorMessage(
          "No se pudo cargar la información de Capital humano."
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
  editingRecord?.id,
]);

  const registeredAcademicTermIds =
    useMemo(
      () =>
        new Set(
          records.map(
            (record) =>
              record.academicTermId
          )
        ),
      [records]
    );

  const availableAcademicTerms =
    useMemo(
      () =>
        academicTerms.filter(
          (academicTerm) =>
            !registeredAcademicTermIds.has(
              academicTerm.id
            )
        ),
      [
        academicTerms,
        registeredAcademicTermIds,
      ]
    );

  const formAcademicTerms =
    useMemo(
      () =>
        academicTerms.filter(
          (academicTerm) =>
            academicTerm.id ===
              editingRecord
                ?.academicTermId ||

            !registeredAcademicTermIds.has(
              academicTerm.id
            )
        ),
      [
        academicTerms,
        editingRecord,
        registeredAcademicTermIds,
      ]
    );

  const totals = useMemo(
    () =>
      records.reduce(
        (result, record) => ({
          tmTuesday:
            result.tmTuesday +
            record.tmTuesday,

          tvThursday:
            result.tvThursday +
            record.tvThursday,

          totalParticipants:
            result.totalParticipants +
            record.totalParticipants,
        }),
        {
          tmTuesday: 0,
          tvThursday: 0,
          totalParticipants: 0,
        }
      ),
    [records]
  );

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleOpenEdit = (
    record: HumanCapitalRecord
  ) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleSaved = (
    savedRecord: HumanCapitalRecord
  ) => {
    setRecords((current) =>
      sortHumanCapitalRecords([
        ...current.filter(
          (record) =>
            record.id !==
            savedRecord.id
        ),

        savedRecord,
      ])
    );

    handleCloseForm();
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Capital humano
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Participación agregada por
            turno y cuatrimestre.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            leftIcon={
              <FiRefreshCw />
            }
            onClick={() =>
              void loadData()
            }
            loading={loading}
          >
            Actualizar
          </Button>

          {canManage &&
            !showForm && (
              <Button
                leftIcon={
                  <FiPlus />
                }
                onClick={
                  handleOpenCreate
                }
                disabled={
                  availableAcademicTerms
                    .length === 0
                }
                title={
                  availableAcademicTerms
                    .length === 0
                    ? "Todos los cuatrimestres ya tienen un registro."
                    : undefined
                }
              >
                Nueva participación
              </Button>
            )}
        </div>
      </section>

      <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/30">
        <p className="text-sm font-medium text-sky-800 dark:text-sky-300">
          Un resultado por cuatrimestre
        </p>

        <p className="mt-1 text-sm text-sky-700 dark:text-sky-400">
          Cada registro concentra la
          participación de T.M. Martes y
          T.V. Jueves. Los totales se
          calculan automáticamente y los
          registros no se eliminan.
        </p>
      </section>

      {!canManage && (
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tienes acceso de consulta.
            Solo un administrador puede
            crear o editar estos
            resultados.
          </p>
        </section>
      )}

      {showForm &&
  canManage && (
    <div
      ref={formContainerRef}
      className="scroll-mt-28"
    >
      <HumanCapitalForm
        key={
          editingRecord?.id ??
          "new-human-capital"
        }
        academicTerms={
          formAcademicTerms
        }
        initialRecord={
          editingRecord
        }
        onSaved={handleSaved}
        onCancel={
          handleCloseForm
        }
      />
    </div>
  )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Cuatrimestres registrados"
          value={records.length}
        />

        <SummaryCard
          label="T.M. Martes"
          value={totals.tmTuesday}
        />

        <SummaryCard
          label="T.V. Jueves"
          value={totals.tvThursday}
        />

        <SummaryCard
          label="Participación total"
          value={
            totals.totalParticipants
          }
          highlighted
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
              void loadData()
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

            <Table.HeaderCell align="right">
              T.M. Martes
            </Table.HeaderCell>

            <Table.HeaderCell align="right">
              T.V. Jueves
            </Table.HeaderCell>

            <Table.HeaderCell align="right">
              Total
            </Table.HeaderCell>

            <Table.HeaderCell>
              Observaciones
            </Table.HeaderCell>

            <Table.HeaderCell>
              Actualización
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
            }).map(
              (_, rowIndex) => (
                <Table.Row
                  key={rowIndex}
                >
                  {Array.from({
                    length: 7,
                  }).map(
                    (
                      __,
                      cellIndex
                    ) => (
                      <Table.Cell
                        key={
                          cellIndex
                        }
                        align={
                          [
                            1,
                            2,
                            3,
                            6,
                          ].includes(
                            cellIndex
                          )
                            ? "right"
                            : "left"
                        }
                      >
                        <Skeleton
                          variant="text"
                          className={
                            [
                              1,
                              2,
                              3,
                              6,
                            ].includes(
                              cellIndex
                            )
                              ? "ml-auto w-20"
                              : "w-28"
                          }
                        />
                      </Table.Cell>
                    )
                  )}
                </Table.Row>
              )
            )}

          {!loading &&
            !errorMessage &&
            records.length ===
              0 && (
              <Table.Empty
                colSpan={7}
                icon={
                  <FiUsers
                    size={30}
                  />
                }
                title="No hay participación registrada"
                description="Agrega el primer resultado de Capital humano."
              />
            )}

          {!loading &&
            !errorMessage &&
            records.map(
              (record) => (
                <Table.Row
                  key={record.id}
                >
                  <Table.Cell>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-800 dark:text-white">
                        {
                          record.academicTermLabel
                        }
                      </span>

                      {isCurrentAcademicTerm(
                        record,
                        academicTerms
                      ) && (
                        <Badge
                          variant="success"
                          dot
                        >
                          Actual
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>

                  <Table.Cell align="right">
                    {formatNumber(
                      record.tmTuesday
                    )}
                  </Table.Cell>

                  <Table.Cell align="right">
                    {formatNumber(
                      record.tvThursday
                    )}
                  </Table.Cell>

                  <Table.Cell align="right">
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {formatNumber(
                        record.totalParticipants
                      )}
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <span
                      className="block max-w-xs truncate"
                      title={
                        record.notes ??
                        undefined
                      }
                    >
                      {record.notes ??
                        "—"}
                    </span>
                  </Table.Cell>

                  <Table.Cell className="whitespace-nowrap">
                    {formatDate(
                      record.updatedAt
                    )}
                  </Table.Cell>

                  <Table.Cell align="right">
                    {canManage ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        leftIcon={
                          <FiEdit2 />
                        }
                        onClick={() =>
                          handleOpenEdit(
                            record
                          )
                        }
                      >
                        Editar
                      </Button>
                    ) : (
                      <Badge variant="outline">
                        Solo lectura
                      </Badge>
                    )}
                  </Table.Cell>
                </Table.Row>
              )
            )}
        </Table.Body>
      </Table>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Los registros no se eliminan para
        conservar el historial de
        participación del programa.
      </p>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  highlighted?: boolean;
}

function SummaryCard({
  label,
  value,
  highlighted = false,
}: SummaryCardProps) {
  return (
    <div
      className={
        highlighted
          ? "rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30"
          : "rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
      }
    >
      <p
        className={
          highlighted
            ? "text-sm font-medium text-emerald-700 dark:text-emerald-300"
            : "text-sm font-medium text-slate-500 dark:text-slate-400"
        }
      >
        {label}
      </p>

      <p
        className={
          highlighted
            ? "mt-1 text-3xl font-bold text-emerald-800 dark:text-emerald-200"
            : "mt-1 text-3xl font-bold text-slate-800 dark:text-white"
        }
      >
        {formatNumber(value)}
      </p>
    </div>
  );
}

function sortHumanCapitalRecords(
  records: HumanCapitalRecord[]
): HumanCapitalRecord[] {
  return [...records].sort(
    (a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }

      return (
        getTermOrder(b.term) -
        getTermOrder(a.term)
      );
    }
  );
}

function getTermOrder(
  term: AcademicTermCode
): number {
  if (term === "E-A") {
    return 1;
  }

  if (term === "M-A") {
    return 2;
  }

  return 3;
}

function isCurrentAcademicTerm(
  record: HumanCapitalRecord,
  academicTerms: AcademicTerm[]
): boolean {
  return academicTerms.some(
    (academicTerm) =>
      academicTerm.id ===
        record.academicTermId &&
      academicTerm.isCurrent
  );
}

function formatNumber(
  value: number
): string {
  return value.toLocaleString(
    "es-MX"
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