import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiBriefcase,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";

import InternshipParticipationForm from "@/components/forms/InternshipParticipationForm";
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
  internshipParticipationService,
} from "@/services/internshipParticipationService";

import type {
  AcademicTerm,
} from "@/types/academicTerm";

import type {
  AcademicLevel,
  AcademicProgram,
  InternshipParticipationRecord,
} from "@/types/internshipParticipation";

export default function InternshipParticipationSection() {
  const { profile } = useAuth();

  const canManage =
    profile?.active === true &&
    profile.role === "admin";

  const [records, setRecords] =
    useState<
      InternshipParticipationRecord[]
    >([]);

  const [
    academicTerms,
    setAcademicTerms,
  ] = useState<AcademicTerm[]>([]);

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

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingRecord,
    setEditingRecord,
  ] =
    useState<
      InternshipParticipationRecord | null
    >(null);

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
          programsData,
        ] = await Promise.all([
          internshipParticipationService.getAll(),

          academicTermsService.getAll(),

          internshipParticipationService.getPrograms(),
        ]);

        setRecords(
          sortInternshipRecords(
            recordsData
          )
        );

        setAcademicTerms(
          termsData
        );

        setAcademicPrograms(
          programsData
        );
      } catch (error) {
        console.error(
          "Error al cargar Capital estadías:",
          error
        );

        setErrorMessage(
          "No se pudo cargar la información de Capital estadías."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      internshipParticipationService.getAll(),

      academicTermsService.getAll(),

      internshipParticipationService.getPrograms(),
    ])
      .then(
        ([
          recordsData,
          termsData,
          programsData,
        ]) => {
          if (cancelled) {
            return;
          }

          setRecords(
            sortInternshipRecords(
              recordsData
            )
          );

          setAcademicTerms(
            termsData
          );

          setAcademicPrograms(
            programsData
          );
        }
      )
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Error al cargar Capital estadías:",
          error
        );

        setErrorMessage(
          "No se pudo cargar la información de Capital estadías."
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
      window.requestAnimationFrame(() => {
        formContainerRef.current
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      });

    return () => {
      window.cancelAnimationFrame(
        animationFrame
      );
    };
  }, [
    showForm,
    editingRecord?.id,
  ]);

  const totals = useMemo(
    () => ({
      records:
        records.length,

      academicTerms:
        new Set(
          records.map(
            (record) =>
              record.academicTermId
          )
        ).size,

      academicPrograms:
        new Set(
          records.map(
            (record) =>
              record.academicProgramId
          )
        ).size,

      participants:
        records.reduce(
          (total, record) =>
            total +
            record.participantCount,
          0
        ),
    }),
    [records]
  );

  const canCreate =
    academicTerms.length > 0 &&
    academicPrograms.length > 0;

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleOpenEdit = (
    record:
      InternshipParticipationRecord
  ) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleSaved = (
    savedRecord:
      InternshipParticipationRecord
  ) => {
    setRecords((current) =>
      sortInternshipRecords([
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
            Capital estadías
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Participación por carrera,
            nivel académico y
            cuatrimestre.
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
                disabled={!canCreate}
                title={
                  canCreate
                    ? undefined
                    : "Se necesita al menos un cuatrimestre y una carrera activa."
                }
              >
                Nueva participación
              </Button>
            )}
        </div>
      </section>

      <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/30">
        <p className="text-sm font-medium text-sky-800 dark:text-sky-300">
          Varios registros por
          cuatrimestre
        </p>

        <p className="mt-1 text-sm text-sky-700 dark:text-sky-400">
          Un cuatrimestre puede incluir
          varias carreras y niveles. Solo
          puede existir un registro por
          la misma combinación de
          cuatrimestre, carrera y nivel
          académico.
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
            <InternshipParticipationForm
              key={
                editingRecord?.id ??
                "new-internship-participation"
              }
              academicTerms={
                academicTerms
              }
              academicPrograms={
                academicPrograms
              }
              initialRecord={
                editingRecord
              }
              onSaved={
                handleSaved
              }
              onCancel={
                handleCloseForm
              }
            />
          </div>
        )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Registros"
          value={totals.records}
        />

        <SummaryCard
          label="Cuatrimestres"
          value={
            totals.academicTerms
          }
        />

        <SummaryCard
          label="Carreras participantes"
          value={
            totals.academicPrograms
          }
        />

        <SummaryCard
          label="Participación total"
          value={
            totals.participants
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

            <Table.HeaderCell>
              Carrera
            </Table.HeaderCell>

            <Table.HeaderCell>
              Nivel
            </Table.HeaderCell>

            <Table.HeaderCell align="right">
              Participantes
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
                  <FiBriefcase
                    size={30}
                  />
                }
                title="No hay participación registrada"
                description="Agrega el primer resultado de Capital estadías."
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

                  <Table.Cell>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {
                        record.academicProgramName
                      }
                    </span>
                  </Table.Cell>

                  <Table.Cell>
                    <Badge
                      variant={getAcademicLevelBadgeVariant(
                        record.academicLevel
                      )}
                    >
                      {
                        record.academicLevel
                      }
                    </Badge>
                  </Table.Cell>

                  <Table.Cell align="right">
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {formatNumber(
                        record.participantCount
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
        Los registros no se eliminan
        para conservar el historial de
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

function sortInternshipRecords(
  records:
    InternshipParticipationRecord[]
): InternshipParticipationRecord[] {
  return [...records].sort(
    (a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }

      const termDifference =
        getTermOrder(b.term) -
        getTermOrder(a.term);

      if (termDifference !== 0) {
        return termDifference;
      }

      const programDifference =
        a.academicProgramName.localeCompare(
          b.academicProgramName,
          "es"
        );

      if (
        programDifference !== 0
      ) {
        return programDifference;
      }

      return a.academicLevel.localeCompare(
        b.academicLevel,
        "es"
      );
    }
  );
}

function getTermOrder(
  term: unknown
): number {
  if (term === "E-A") {
    return 1;
  }

  if (term === "M-A") {
    return 2;
  }

  if (term === "S-D") {
    return 3;
  }

  return 0;
}

function isCurrentAcademicTerm(
  record:
    InternshipParticipationRecord,

  academicTerms: AcademicTerm[]
): boolean {
  return academicTerms.some(
    (academicTerm) =>
      academicTerm.id ===
        record.academicTermId &&
      academicTerm.isCurrent
  );
}

function getAcademicLevelBadgeVariant(
  academicLevel: AcademicLevel
):
  | "primary"
  | "secondary"
  | "warning" {
  if (academicLevel === "TSU") {
    return "primary";
  }

  if (
    academicLevel ===
    "Licenciatura"
  ) {
    return "secondary";
  }

  return "warning";
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