import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiActivity,
  FiCalendar,
  FiDatabase,
  FiEdit2,
  FiInbox,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiTrendingUp,
} from "react-icons/fi";

import StatCard from "@/components/charts/StatCard";
import CollectionForm from "@/components/forms/CollectionForm";

import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  useConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  Input,
} from "@/components/ui/input";

import Pagination from "@/components/ui/pagination";
import Skeleton from "@/components/ui/skeleton/Skeleton";

import {
  Table,
} from "@/components/ui/table";

import {
  useToast,
} from "@/components/ui/toast/toast";

import {
  useAuth,
} from "@/context/auth/useAuth";

import {
  usePagination,
} from "@/hooks/usePagination";

import {
  academicTermsService,
} from "@/services/academicTermsService";

import {
  collectionsService,
} from "@/services/collectionsService";

import {
  materialsService,
} from "@/services/materialsService";

import type {
  AcademicTerm,
} from "@/types/academicTerm";

import type {
  CollectionListItem,
} from "@/types/collection";

import type {
  Material,
} from "@/types/material";

type CollectionScope =
  | "all"
  | "current-term";

interface CollectionSummary {
  totalKilograms: number;
  currentTermKilograms: number;
  currentTermCount: number;
  topMaterialName: string;
  topMaterialKilograms: number;
}

export default function Collections() {
  const {
    user,
    profile,
  } = useAuth();

  const confirm =
    useConfirmModal();

  const { toast } =
    useToast();

  const [
    collections,
    setCollections,
  ] = useState<
    CollectionListItem[]
  >([]);

  const [
    materials,
    setMaterials,
  ] = useState<Material[]>([]);

  const [
    academicTerms,
    setAcademicTerms,
  ] = useState<
    AcademicTerm[]
  >([]);

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
    editingCollection,
    setEditingCollection,
  ] =
    useState<CollectionListItem | null>(
      null
    );

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(
    null
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    scope,
    setScope,
  ] =
    useState<CollectionScope>(
      "all"
    );

  const currentAcademicTerm =
    academicTerms.find(
      (academicTerm) =>
        academicTerm.isCurrent
    ) ?? null;

  const currentAcademicTermId =
    currentAcademicTerm?.id ??
    null;

  const summary =
    useMemo(
      () =>
        getCollectionSummary(
          collections,
          currentAcademicTermId
        ),
      [
        collections,
        currentAcademicTermId,
      ]
    );

  const filteredCollections =
    useMemo(() => {
      const normalizedSearch =
        normalizeSearch(search);

      return collections.filter(
        (collection) => {
          const matchesScope =
            scope === "all" ||
            collection.academicTermId ===
              currentAcademicTermId;

          if (!matchesScope) {
            return false;
          }

          if (
            !normalizedSearch
          ) {
            return true;
          }

          const searchableText =
            normalizeSearch(
              [
                collection.materialName,
                collection.academicTermLabel,
                collection.location,
                collection.notes,
                formatDate(
                  collection.date
                ),
                collection.kilograms.toString(),
              ]
                .filter(Boolean)
                .join(" ")
            );

          return searchableText.includes(
            normalizedSearch
          );
        }
      );
    }, [
      collections,
      currentAcademicTermId,
      scope,
      search,
    ]);

  const {
    currentPage,
    pageSize,
    totalItems,

    paginatedItems:
      paginatedCollections,

    setCurrentPage,
    setPageSize,
    resetPage,
  } = usePagination(
    filteredCollections
  );

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [
          collectionsData,
          materialsData,
          academicTermsData,
        ] = await Promise.all([
          collectionsService.getAll(),

          materialsService.getActive(),

          academicTermsService.getAll(),
        ]);

        if (!cancelled) {
          setCollections(
            collectionsData
          );

          setMaterials(
            materialsData
          );

          setAcademicTerms(
            academicTermsData
          );
        }
      } catch (error) {
        console.error(
          "Error cargando colecciones:",
          error
        );

        if (!cancelled) {
          setErrorMessage(
            "No se pudieron cargar las colecciones."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenCreate =
    () => {
      setEditingCollection(
        null
      );

      setShowForm(true);
    };

  const handleOpenEdit = (
    collection:
      CollectionListItem
  ) => {
    setEditingCollection(
      collection
    );

    setShowForm(true);
  };

  const handleCloseForm =
    () => {
      setShowForm(false);

      setEditingCollection(
        null
      );
    };

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);
    resetPage();
  };

  const handleScopeChange = (
    nextScope:
      CollectionScope
  ) => {
    setScope(nextScope);
    resetPage();
  };

  const clearFilters = () => {
    setSearch("");
    setScope("all");
    resetPage();
  };

  const handleSaved = (
    collection:
      CollectionListItem
  ) => {
    if (editingCollection) {
      setCollections(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              collection.id
                ? collection
                : item
          )
      );
    } else {
      setCollections(
        (current) => [
          collection,
          ...current,
        ]
      );

      resetPage();
    }

    handleCloseForm();
  };

  const handleDelete =
    async (
      collection:
        CollectionListItem
    ) => {
      const confirmed =
        await confirm({
          title:
            "Eliminar recolección",

          description:
            `Se eliminará el registro de ${collection.materialName} ` +
            `(${formatKilograms(
              collection.kilograms
            )}). ` +
            "Esta acción no se puede deshacer.",

          confirmText:
            "Eliminar",

          cancelText:
            "Cancelar",

          variant:
            "danger",
        });

      if (!confirmed) {
        return;
      }

      setDeletingId(
        collection.id
      );

      try {
        await collectionsService.remove(
          collection.id
        );

        setCollections(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                collection.id
            )
        );

        if (
          editingCollection?.id ===
          collection.id
        ) {
          handleCloseForm();
        }

        toast.success({
          title:
            "Recolección eliminada",

          description:
            "El registro fue eliminado correctamente.",
        });
      } catch (error) {
        console.error(
          "Error eliminando recolección:",
          error
        );

        toast.error({
          title:
            "No se pudo eliminar",

          description:
            error instanceof Error
              ? error.message
              : "Ocurrió un problema al eliminar el registro.",
        });
      } finally {
        setDeletingId(null);
      }
    };

  const filtersAreActive =
    Boolean(search.trim()) ||
    scope !== "all";

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-white via-white to-emerald-50/70 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/25 sm:p-7">
        <div
          aria-hidden="true"
          className="absolute -right-14 -top-20 h-48 w-48 rounded-full border-28 border-emerald-500/5"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <FiDatabase
                aria-hidden="true"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  Colecciones
                </h1>

                {currentAcademicTerm ? (
                  <Badge variant="primary">
                    <FiCalendar
                      aria-hidden="true"
                    />

                    {
                      currentAcademicTerm.label
                    }
                  </Badge>
                ) : (
                  <Badge variant="warning">
                    Sin periodo actual
                  </Badge>
                )}
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Registra, consulta y
                administra los residuos
                recolectados por UTCJ
                Sustentable.
              </p>
            </div>
          </div>

          {!showForm && (
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
                loading ||
                Boolean(
                  errorMessage
                )
              }
              className="shrink-0"
            >
              Nueva recolección
            </Button>
          )}
        </div>
      </section>

      {errorMessage && (
        <Card
          variant="outlined"
          className="border-red-200 dark:border-red-900"
        >
          <Card.Body className="flex gap-3 p-5">
            <FiActivity
              className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
              size={20}
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                {errorMessage}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Verifica la conexión
                con Supabase y recarga
                la página.
              </p>
            </div>
          </Card.Body>
        </Card>
      )}

      {showForm && user && (
        <CollectionForm
          key={
            editingCollection?.id ??
            "new-collection"
          }
          materials={
            materials
          }
          academicTerms={
            academicTerms
          }
          userId={user.id}
          initialCollection={
            editingCollection
          }
          onSaved={
            handleSaved
          }
          onCancel={
            handleCloseForm
          }
        />
      )}

      <section
        aria-labelledby="collection-summary-title"
      >
        <div className="mb-4">
          <h2
            id="collection-summary-title"
            className="text-lg font-semibold text-slate-900 dark:text-white"
          >
            Resumen operativo
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Información
            correspondiente a las
            recolecciones capturadas
            desde el sistema.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total recolectado"
            value={
              summary.totalKilograms
            }
            unit="kg"
            decimals={2}
            isLoading={
              loading
            }
            accent="emerald"
            icon={
              <FiPackage
                aria-hidden="true"
              />
            }
            helper="Suma de las recolecciones operativas registradas"
          />

          <StatCard
            label="Recolecciones"
            value={
              collections.length
            }
            decimals={0}
            isLoading={
              loading
            }
            accent="sky"
            icon={
              <FiDatabase
                aria-hidden="true"
              />
            }
            helper="Registros disponibles en el historial"
          />

          <StatCard
            label="Cuatrimestre actual"
            value={
              summary
                .currentTermKilograms
            }
            unit="kg"
            decimals={2}
            isLoading={
              loading
            }
            accent="violet"
            icon={
              <FiCalendar
                aria-hidden="true"
              />
            }
            helper={
              currentAcademicTerm
                ? `${summary.currentTermCount} recolecciones · ${currentAcademicTerm.label}`
                : "No hay un periodo actual configurado"
            }
          />

          <StatCard
            label="Materiales activos"
            value={
              materials.length
            }
            decimals={0}
            isLoading={
              loading
            }
            accent="amber"
            icon={
              <FiTrendingUp
                aria-hidden="true"
              />
            }
            helper={
              summary.topMaterialName
                ? `Más recolectado: ${summary.topMaterialName} (${formatKilograms(
                    summary
                      .topMaterialKilograms
                  )})`
                : "Todavía no hay un material destacado"
            }
          />
        </div>
      </section>

      <Card variant="outlined">
        <Card.Header className="flex-row flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Card.Title>
                Historial de
                recolecciones
              </Card.Title>

              <Badge variant="secondary">
                {
                  filteredCollections.length
                }{" "}
                registros
              </Badge>
            </div>

            <Card.Description className="mt-1">
              Busca, filtra y
              administra los registros
              capturados.
            </Card.Description>
          </div>

          {filtersAreActive && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              leftIcon={
                <FiRefreshCw
                  aria-hidden="true"
                />
              }
              onClick={
                clearFilters
              }
            >
              Limpiar filtros
            </Button>
          )}
        </Card.Header>

        <Card.Body className="space-y-5 p-5">
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-end lg:justify-between dark:border-slate-700 dark:bg-slate-950/50">
            <div className="w-full lg:max-w-md">
              <Input
                id="collections-search"
                name="collectionsSearch"
                type="search"
                label="Buscar en el historial"
                placeholder="Material, ubicación, notas o cuatrimestre..."
                value={search}
                onChange={(
                  event
                ) =>
                  handleSearchChange(
                    event.target
                      .value
                  )
                }
                leftIcon={
                  <FiSearch
                    aria-hidden="true"
                  />
                }
                clearable
                autoComplete="off"
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Periodo mostrado
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    scope ===
                    "all"
                      ? "primary"
                      : "secondary"
                  }
                  onClick={() =>
                    handleScopeChange(
                      "all"
                    )
                  }
                >
                  Todos
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant={
                    scope ===
                    "current-term"
                      ? "primary"
                      : "secondary"
                  }
                  leftIcon={
                    <FiCalendar
                      aria-hidden="true"
                    />
                  }
                  disabled={
                    !currentAcademicTerm
                  }
                  onClick={() =>
                    handleScopeChange(
                      "current-term"
                    )
                  }
                >
                  Cuatrimestre actual
                </Button>
              </div>
            </div>
          </div>

          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>
                  Fecha
                </Table.HeaderCell>

                <Table.HeaderCell>
                  Material
                </Table.HeaderCell>

                <Table.HeaderCell>
                  Cuatrimestre
                </Table.HeaderCell>

                <Table.HeaderCell align="right">
                  Peso
                </Table.HeaderCell>

                <Table.HeaderCell>
                  Ubicación
                </Table.HeaderCell>

                <Table.HeaderCell>
                  Observaciones
                </Table.HeaderCell>

                <Table.HeaderCell align="right">
                  Acciones
                </Table.HeaderCell>
              </Table.Row>
            </Table.Head>

            <Table.Body>
              {loading ? (
                Array.from({
                  length: 5,
                }).map(
                  (
                    _,
                    rowIndex
                  ) => (
                    <Table.Row
                      key={
                        rowIndex
                      }
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
                          >
                            <Skeleton
                              variant="text"
                              className="w-20"
                            />
                          </Table.Cell>
                        )
                      )}
                    </Table.Row>
                  )
                )
              ) : filteredCollections.length ===
                0 ? (
                <Table.Empty
                  colSpan={7}
                  icon={
                    <FiInbox
                      size={30}
                    />
                  }
                  title={
                    filtersAreActive
                      ? "No hay coincidencias"
                      : "No hay recolecciones"
                  }
                  description={
                    filtersAreActive
                      ? "Cambia o limpia los filtros para consultar otros registros."
                      : "Registra la primera recolección para comenzar a generar información."
                  }
                />
              ) : (
                paginatedCollections.map(
                  (
                    collection
                  ) => {
                    const canManage =
                      profile?.role ===
                        "admin" ||
                      collection.createdBy ===
                        user?.id;

                    return (
                      <Table.Row
                        key={
                          collection.id
                        }
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/35"
                      >
                        <Table.Cell>
                          {formatDate(
                            collection.date
                          )}
                        </Table.Cell>

                        <Table.Cell>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {
                              collection.materialName
                            }
                          </span>
                        </Table.Cell>

                        <Table.Cell>
                          <Badge variant="secondary">
                            {
                              collection.academicTermLabel
                            }
                          </Badge>
                        </Table.Cell>

                        <Table.Cell align="right">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {formatKilograms(
                              collection.kilograms
                            )}
                          </span>
                        </Table.Cell>

                        <Table.Cell>
                          {collection.location ||
                            "—"}
                        </Table.Cell>

                        <Table.Cell>
                          <span
                            className="block max-w-xs truncate"
                            title={
                              collection.notes ??
                              undefined
                            }
                          >
                            {collection.notes ||
                              "—"}
                          </span>
                        </Table.Cell>

                        <Table.Cell align="right">
                          {canManage ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                leftIcon={
                                  <FiEdit2
                                    aria-hidden="true"
                                  />
                                }
                                disabled={
                                  deletingId !==
                                  null
                                }
                                onClick={() =>
                                  handleOpenEdit(
                                    collection
                                  )
                                }
                              >
                                Editar
                              </Button>

                              <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                leftIcon={
                                  <FiTrash2
                                    aria-hidden="true"
                                  />
                                }
                                loading={
                                  deletingId ===
                                  collection.id
                                }
                                disabled={
                                  deletingId !==
                                  null
                                }
                                onClick={() =>
                                  void handleDelete(
                                    collection
                                  )
                                }
                              >
                                Eliminar
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              Sin permisos
                            </span>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    );
                  }
                )
              )}
            </Table.Body>
          </Table>

          <Pagination
            currentPage={
              currentPage
            }
            totalItems={
              totalItems
            }
            pageSize={pageSize}
            onPageChange={
              setCurrentPage
            }
            onPageSizeChange={
              setPageSize
            }
          />
        </Card.Body>
      </Card>
    </div>
  );
}

function getCollectionSummary(
  collections:
    CollectionListItem[],
  currentAcademicTermId:
    | string
    | null
): CollectionSummary {
  let totalKilograms = 0;

  let currentTermKilograms =
    0;

  let currentTermCount = 0;

  const materialTotals =
    new Map<string, number>();

  for (
    const collection of
    collections
  ) {
    totalKilograms +=
      collection.kilograms;

    materialTotals.set(
      collection.materialName,

      (
        materialTotals.get(
          collection.materialName
        ) ?? 0
      ) +
        collection.kilograms
    );

    if (
      currentAcademicTermId &&
      collection.academicTermId ===
        currentAcademicTermId
    ) {
      currentTermKilograms +=
        collection.kilograms;

      currentTermCount += 1;
    }
  }

  const topMaterial =
    Array.from(
      materialTotals.entries()
    ).sort(
      (
        first,
        second
      ) =>
        second[1] -
        first[1]
    )[0];

  return {
    totalKilograms,
    currentTermKilograms,
    currentTermCount,

    topMaterialName:
      topMaterial?.[0] ?? "",

    topMaterialKilograms:
      topMaterial?.[1] ?? 0,
  };
}

function normalizeSearch(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLocaleLowerCase("es")
    .trim();
}

function formatDate(
  date: string
) {
  const [
    year,
    month,
    day,
  ] = date.split("-");

  return `${day}/${month}/${year}`;
}

function formatKilograms(
  kilograms: number
) {
  return `${new Intl.NumberFormat(
    "es-MX",
    {
      maximumFractionDigits: 3,
    }
  ).format(kilograms)} kg`;
}