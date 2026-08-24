import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiEdit2,
  FiInfo,
  FiPlus,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";

import StatCard from "@/components/charts/StatCard";
import InternshipParticipationForm from "@/components/forms/InternshipParticipationForm";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Pagination from "@/components/ui/pagination";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import { Table } from "@/components/ui/table";

import { useAuth } from "@/context/auth/useAuth";
import { usePagination } from "@/hooks/usePagination";

import { academicTermsService } from "@/services/academicTermsService";
import { internshipParticipationService } from "@/services/internshipParticipationService";

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
  ] = useState<
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

        setAcademicTerms(termsData);

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

          setAcademicTerms(termsData);

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
  }, [showForm, editingRecord?.id]);

  const totals = useMemo(
    () => ({
      records: records.length,

      academicTerms: new Set(
        records.map(
          (record) =>
            record.academicTermId
        )
      ).size,

      academicPrograms: new Set(
        records.map(
          (record) =>
            record.academicProgramId
        )
      ).size,

      participants: records.reduce(
        (total, record) =>
          total +
          record.participantCount,
        0
      ),
    }),
    [records]
  );

  const {
    currentPage,
    pageSize,
    totalItems,
    paginatedItems:
      paginatedRecords,
    setCurrentPage,
    setPageSize,
    resetPage,
  } = usePagination(records);

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
    if (!editingRecord) {
      resetPage();
    }

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
      <Card
        variant="outlined"
        className="relative overflow-hidden"
      >
        <span
          aria-hidden="true"
          className="
            absolute inset-y-0
            left-0 w-1
            bg-violet-500
          "
        />

        <Card.Body
          className="
            p-5 pl-6
            sm:p-6 sm:pl-7
          "
        >
          <div
            className="
              flex flex-col gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  flex h-11 w-11 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-violet-100
                  text-xl text-violet-700
                  dark:bg-violet-900/40
                  dark:text-violet-300
                "
              >
                <FiBriefcase
                  aria-hidden="true"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="
                      text-xl font-bold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Capital estadías
                  </h2>

                  <Badge
                    variant={
                      canManage
                        ? "success"
                        : "outline"
                    }
                  >
                    {canManage
                      ? "Administración"
                      : "Solo consulta"}
                  </Badge>
                </div>

                <p
                  className="
                    mt-1 text-sm leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Participación por carrera,
                  nivel académico y
                  cuatrimestre.
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
                      <FiPlus
                        aria-hidden="true"
                      />
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
          </div>

          <div
            className="
              mt-5 flex gap-3
              rounded-xl border
              border-violet-200
              bg-violet-50 p-4
              dark:border-violet-900/60
              dark:bg-violet-950/30
            "
          >
            <FiInfo
              className="
                mt-0.5 shrink-0
                text-violet-700
                dark:text-violet-300
              "
              aria-hidden="true"
            />

            <div>
              <p
                className="
                  text-sm font-semibold
                  text-violet-800
                  dark:text-violet-300
                "
              >
                Varios registros por
                cuatrimestre
              </p>

              <p
                className="
                  mt-1 text-sm leading-6
                  text-violet-700
                  dark:text-violet-400
                "
              >
                Puedes registrar varias
                carreras y niveles en un
                periodo. Solo se permite una
                coincidencia de cuatrimestre,
                carrera y nivel académico.
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {showForm && canManage && (
        <div
          ref={formContainerRef}
          className="scroll-mt-28"
        >
          <InternshipParticipationForm
            key={
              editingRecord?.id ??
              "new-internship-participation"
            }
            academicTerms={academicTerms}
            academicPrograms={
              academicPrograms
            }
            initialRecord={
              editingRecord
            }
            onSaved={handleSaved}
            onCancel={handleCloseForm}
          />
        </div>
      )}

      <section
        className="
          grid gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          label="Registros"
          value={totals.records}
          isLoading={loading}
          accent="sky"
          decimals={0}
          icon={
            <FiBriefcase
              aria-hidden="true"
            />
          }
          helper="Combinaciones registradas en el historial"
        />

        <StatCard
          label="Cuatrimestres"
          value={
            totals.academicTerms
          }
          isLoading={loading}
          accent="amber"
          decimals={0}
          icon={
            <FiCalendar
              aria-hidden="true"
            />
          }
          helper="Periodos con participación de estadías"
        />

        <StatCard
          label="Carreras participantes"
          value={
            totals.academicPrograms
          }
          isLoading={loading}
          accent="violet"
          decimals={0}
          icon={
            <FiBookOpen
              aria-hidden="true"
            />
          }
          helper={`${academicPrograms.length.toLocaleString(
            "es-MX"
          )} carreras activas disponibles`}
        />

        <StatCard
          label="Participación total"
          value={totals.participants}
          isLoading={loading}
          accent="emerald"
          decimals={0}
          icon={
            <FiUsers aria-hidden="true" />
          }
          helper="Suma histórica de participantes registrados"
        />
      </section>

      {errorMessage && (
        <Card
          variant="outlined"
          className="
            border-red-200
            dark:border-red-900
          "
        >
          <Card.Body
            className="
              flex flex-col gap-3 p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-sm font-semibold
                  text-red-700
                  dark:text-red-400
                "
              >
                {errorMessage}
              </p>

              <p
                className="
                  mt-1 text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Verifica la conexión con
                Supabase e inténtalo de
                nuevo.
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void loadData()
              }
            >
              Reintentar
            </Button>
          </Card.Body>
        </Card>
      )}

      <Card variant="outlined">
        <Card.Header
          className="
            flex-row items-start
            justify-between gap-4
            border-b border-slate-100
            p-5
            dark:border-slate-800
          "
        >
          <div>
            <Card.Title>
              Historial de Capital estadías
            </Card.Title>

            <Card.Description className="mt-1">
              Resultados ordenados por
              periodo, carrera y nivel
              académico.
            </Card.Description>
          </div>

          <Badge variant="secondary">
            {formatNumber(records.length)}

            {records.length === 1
              ? " registro"
              : " registros"}
          </Badge>
        </Card.Header>

        <Table
          className="
            rounded-none
            border-x-0 border-b-0
            border-t-0
          "
        >
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
                        _,
                        cellIndex
                      ) => (
                        <Table.Cell
                          key={cellIndex}
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
              records.length === 0 && (
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
              paginatedRecords.map(
                (record) => (
                  <Table.Row
                    key={record.id}
                    clickable
                  >
                    <Table.Cell>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="
                            font-medium
                            text-slate-800
                            dark:text-white
                          "
                        >
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
                      <span
                        className="
                          font-medium
                          text-slate-700
                          dark:text-slate-200
                        "
                      >
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
                      <span
                        className="
                          font-semibold
                          text-slate-800
                          dark:text-white
                        "
                      >
                        {formatNumber(
                          record.participantCount
                        )}
                      </span>
                    </Table.Cell>

                    <Table.Cell>
                      <span
                        className="
                          block max-w-xs
                          truncate
                        "
                        title={
                          record.notes ??
                          undefined
                        }
                      >
                        {record.notes ?? "—"}
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
                            <FiEdit2
                              aria-hidden="true"
                            />
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

        {!loading &&
          !errorMessage && (
            <Card.Body
              className="
                border-t
                border-slate-100
                p-4
                dark:border-slate-800
              "
            >
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={
                  setCurrentPage
                }
                onPageSizeChange={
                  setPageSize
                }
                className="
                  mt-0 border-0
                  bg-slate-50
                  shadow-none
                  dark:bg-slate-950/40
                "
              />
            </Card.Body>
          )}
      </Card>

      <p
        className="
          text-xs leading-5
          text-slate-400
          dark:text-slate-500
        "
      >
        Los registros no se eliminan para
        conservar el historial de
        participación del programa.
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