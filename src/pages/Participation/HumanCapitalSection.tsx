import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiCalendar,
  FiClock,
  FiEdit2,
  FiInfo,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSun,
  FiUsers,
  FiX,
} from "react-icons/fi";

import StatCard from "@/components/charts/StatCard";
import HumanCapitalForm from "@/components/forms/HumanCapitalForm";

import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination";
import Dropdown from "@/components/ui/select";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import { Table } from "@/components/ui/table";

import { useAuth } from "@/context/auth/useAuth";
import { usePagination } from "@/hooks/usePagination";

import { academicTermsService } from "@/services/academicTermsService";
import { humanCapitalService } from "@/services/humanCapitalService";

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

  const [records, setRecords] =
    useState<HumanCapitalRecord[]>([]);

  const [academicTerms, setAcademicTerms] =
    useState<AcademicTerm[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [yearFilter, setYearFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingRecord, setEditingRecord] =
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

        setAcademicTerms(termsData);
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
        ([recordsData, termsData]) => {
          if (cancelled) {
            return;
          }

          setRecords(
            sortHumanCapitalRecords(
              recordsData
            )
          );

          setAcademicTerms(termsData);
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
  }, [showForm, editingRecord?.id]);

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

  const yearOptions = useMemo(
    () => [
      {
        value: "all",
        label: "Todos los años",
      },
      ...Array.from(
        new Set(
          records.map(
            (record) => record.year
          )
        )
      )
        .sort((a, b) => b - a)
        .map((year) => ({
          value: String(year),
          label: String(year),
        })),
    ],
    [records]
  );

  const filteredRecords = useMemo(
    () => {
      const normalizedSearch =
        normalizeSearchValue(
          searchTerm.trim()
        );

      return records.filter(
        (record) => {
          const matchesYear =
            yearFilter === "all" ||
            record.year ===
              Number(yearFilter);

          if (!matchesYear) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          const searchableValue =
            normalizeSearchValue(
              [
                record.academicTermLabel,
                record.year,
                record.term,
                record.notes ?? "",
              ].join(" ")
            );

          return searchableValue.includes(
            normalizedSearch
          );
        }
      );
    },
    [
      records,
      searchTerm,
      yearFilter,
    ]
  );

  const filtersAreActive =
    searchTerm.trim().length > 0 ||
    yearFilter !== "all";

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

  const {
    currentPage,
    pageSize,
    totalItems,
    paginatedItems:
      paginatedRecords,
    setCurrentPage,
    setPageSize,
    resetPage,
  } = usePagination(filteredRecords);

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
    if (!editingRecord) {
      resetPage();
    }

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

  const handleClearFilters = () => {
    setSearchTerm("");
    setYearFilter("all");
    resetPage();
  };

  return (
    <div className="space-y-6">
      <Card
        variant="outlined"
        className="relative overflow-hidden"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-sky-500"
        />

        <Card.Body className="p-5 pl-6 sm:p-6 sm:pl-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-xl text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                <FiUsers aria-hidden="true" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Capital humano
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

                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Participación agregada de
                  los turnos T.M. Martes y
                  T.V. Jueves por
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
          </div>

          <div className="mt-5 flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/30">
            <FiInfo
              className="mt-0.5 shrink-0 text-sky-700 dark:text-sky-300"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">
                Un resultado por
                cuatrimestre
              </p>

              <p className="mt-1 text-sm leading-6 text-sky-700 dark:text-sky-400">
                Los dos turnos se concentran
                en un mismo registro. Los
                totales se calculan
                automáticamente y el
                historial no se elimina.
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
            onCancel={handleCloseForm}
          />
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Cuatrimestres registrados"
          value={records.length}
          isLoading={loading}
          accent="amber"
          decimals={0}
          icon={
            <FiCalendar
              aria-hidden="true"
            />
          }
          helper={`${availableAcademicTerms.length.toLocaleString(
            "es-MX"
          )} periodos disponibles para registrar`}
        />

        <StatCard
          label="T.M. Martes"
          value={totals.tmTuesday}
          isLoading={loading}
          accent="sky"
          decimals={0}
          icon={
            <FiSun aria-hidden="true" />
          }
          helper="Participación acumulada del turno matutino"
        />

        <StatCard
          label="T.V. Jueves"
          value={totals.tvThursday}
          isLoading={loading}
          accent="violet"
          decimals={0}
          icon={
            <FiClock aria-hidden="true" />
          }
          helper="Participación acumulada del turno vespertino"
        />

        <StatCard
          label="Participación total"
          value={
            totals.totalParticipants
          }
          isLoading={loading}
          accent="emerald"
          decimals={0}
          icon={
            <FiUsers aria-hidden="true" />
          }
          helper="Suma histórica de ambos turnos"
        />
      </section>

      {errorMessage && (
        <Card
          variant="outlined"
          className="border-red-200 dark:border-red-900"
        >
          <Card.Body className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
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
        <Card.Header className="flex-row items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div>
            <Card.Title>
              Historial de Capital humano
            </Card.Title>

            <Card.Description className="mt-1">
              Resultados ordenados del
              cuatrimestre más reciente al
              más antiguo.
            </Card.Description>
          </div>

          <Badge variant="secondary">
            {filtersAreActive
              ? `${formatNumber(
                  filteredRecords.length
                )} de ${formatNumber(
                  records.length
                )}`
              : formatNumber(
                  records.length
                )}

            {filteredRecords.length === 1
              ? " registro"
              : " registros"}
          </Badge>
        </Card.Header>

        <Card.Body className="border-b border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/25">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
            <Input
              id="human-capital-search"
              name="humanCapitalSearch"
              type="search"
              label="Buscar"
              placeholder="Cuatrimestre u observaciones..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(
                  event.target.value
                );
                resetPage();
              }}
              leftIcon={
                <FiSearch
                  aria-hidden="true"
                />
              }
              clearable
              autoComplete="off"
              disabled={loading}
            />

            <Dropdown
              id="human-capital-year-filter"
              label="Año"
              options={yearOptions}
              value={yearFilter}
              onChange={(value) => {
                setYearFilter(
                  String(value)
                );
                resetPage();
              }}
              disabled={loading}
            />

            {filtersAreActive && (
              <Button
                type="button"
                variant="ghost"
                leftIcon={
                  <FiX
                    aria-hidden="true"
                  />
                }
                onClick={
                  handleClearFilters
                }
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </Card.Body>

        <Table className="rounded-none border-x-0 border-b-0 border-t-0">
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
                        _,
                        cellIndex
                      ) => (
                        <Table.Cell
                          key={cellIndex}
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
              filteredRecords.length ===
                0 && (
                <Table.Empty
                  colSpan={7}
                  icon={
                    <FiUsers size={30} />
                  }
                  title={
                    filtersAreActive
                      ? "No hay coincidencias"
                      : "No hay participación registrada"
                  }
                  description={
                    filtersAreActive
                      ? "Cambia o limpia los filtros para consultar otros registros."
                      : "Agrega el primer resultado de Capital humano."
                  }
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
          !errorMessage &&
          filteredRecords.length > 0 && (
            <Card.Body className="border-t border-slate-100 p-4 dark:border-slate-800">
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
                className="mt-0 border-0 bg-slate-50 shadow-none dark:bg-slate-950/40"
              />
            </Card.Body>
          )}
      </Card>

      <p className="text-xs leading-5 text-slate-400 dark:text-slate-500">
        Los registros no se eliminan para
        conservar el historial de
        participación del programa.
      </p>
    </div>
  );
}

function normalizeSearchValue(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase();
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