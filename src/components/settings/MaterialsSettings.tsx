import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiEdit2,
  FiFilter,
  FiInfo,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import StatCard from "@/components/charts/StatCard";
import MaterialForm from "@/components/forms/MaterialForm";
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
  materialsService,
} from "@/services/materialsService";

import type {
  Material,
} from "@/types/material";

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
    label: "Activos",
  },
  {
    value: "inactive",
    label: "Inactivos",
  },
];

export default function MaterialsSettings() {
  const confirm = useConfirmModal();
  const { toast } = useToast();

  const [materials, setMaterials] =
    useState<Material[]>([]);

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
    editingMaterial,
    setEditingMaterial,
  ] = useState<Material | null>(null);

  const [
    changingMaterialId,
    setChangingMaterialId,
  ] = useState<string | null>(null);

  const formContainerRef =
    useRef<HTMLDivElement>(null);

  const loadMaterials =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await materialsService.getAll();

        setMaterials(data);
      } catch (error) {
        console.error(
          "Error al cargar materiales:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar los materiales."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    let cancelled = false;

    materialsService
      .getAll()
      .then((data) => {
        if (!cancelled) {
          setMaterials(data);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Error al cargar materiales:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar los materiales."
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
  }, [showForm, editingMaterial?.id]);

  const filteredMaterials =
    useMemo(() => {
      const normalizedSearch =
        normalizeSearch(search);

      return materials.filter(
        (material) => {
          const matchesSearch =
            !normalizedSearch ||
            normalizeSearch(
              material.name
            ).includes(
              normalizedSearch
            ) ||
            formatCo2Factor(
              material.co2Factor
            ).includes(
              normalizedSearch
            );

          const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active"
              ? material.active
              : !material.active);

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      materials,
      search,
      statusFilter,
    ]);

  const summary = useMemo(() => {
    const active = materials.filter(
      (material) => material.active
    ).length;

    const averageFactor =
      materials.length > 0
        ? materials.reduce(
            (total, material) =>
              total +
              material.co2Factor,
            0
          ) / materials.length
        : 0;

    return {
      total: materials.length,
      active,
      inactive:
        materials.length - active,
      averageFactor,
    };
  }, [materials]);

  const {
    currentPage,
    pageSize,
    totalItems,
    paginatedItems:
      paginatedMaterials,
    setCurrentPage,
    setPageSize,
    resetPage,
  } = usePagination(filteredMaterials);

  const filtersAreActive =
    Boolean(search.trim()) ||
    statusFilter !== "all";

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  const handleOpenEdit = (
    material: Material
  ) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingMaterial(null);
    setShowForm(false);
  };

  const handleSaved = (
    savedMaterial: Material
  ) => {
    if (!editingMaterial) {
      resetPage();
    }

    setMaterials((current) =>
      sortMaterials([
        ...current.filter(
          (material) =>
            material.id !==
            savedMaterial.id
        ),
        savedMaterial,
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
    material: Material,
    nextActive: boolean
  ) => {
    if (
      changingMaterialId !== null ||
      material.active === nextActive
    ) {
      return;
    }

    if (!nextActive) {
      const confirmed = await confirm({
        title: "Desactivar material",

        description:
          `${material.name} dejará de aparecer al registrar nuevas recolecciones. Su historial se conservará.`,

        confirmText: "Desactivar",
        cancelText: "Cancelar",
        variant: "danger",
      });

      if (!confirmed) {
        return;
      }
    }

    try {
      setChangingMaterialId(
        material.id
      );

      const updatedMaterial =
        await materialsService.setActive(
          material.id,
          nextActive
        );

      setMaterials((current) =>
        current.map(
          (currentMaterial) =>
            currentMaterial.id ===
            updatedMaterial.id
              ? updatedMaterial
              : currentMaterial
        )
      );

      toast.success({
        title: nextActive
          ? "Material activado"
          : "Material desactivado",

        description:
          `${material.name} fue actualizado correctamente.`,
      });
    } catch (error) {
      console.error(
        "Error al cambiar el estado del material:",
        error
      );

      toast.error({
        title:
          "No se pudo actualizar el material",

        description:
          getErrorMessage(error),
      });
    } finally {
      setChangingMaterialId(null);
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
          className="
            absolute inset-y-0
            left-0 w-1
            bg-emerald-500
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
                  bg-emerald-100
                  text-xl text-emerald-700
                  dark:bg-emerald-900/40
                  dark:text-emerald-300
                "
              >
                <FiPackage
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
                    Materiales
                  </h2>

                  <Badge variant="primary">
                    Catálogo ambiental
                  </Badge>
                </div>

                <p
                  className="
                    mt-1 text-sm leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Administra los materiales
                  disponibles y sus factores
                  para calcular el CO₂
                  evitado.
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
                  void loadMaterials()
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
                  onClick={
                    handleOpenCreate
                  }
                >
                  Nuevo material
                </Button>
              )}
            </div>
          </div>

          <div
            className="
              mt-5 flex gap-3
              rounded-xl border
              border-sky-200
              bg-sky-50 p-4
              dark:border-sky-900/60
              dark:bg-sky-950/30
            "
          >
            <FiInfo
              className="
                mt-0.5 shrink-0
                text-sky-700
                dark:text-sky-300
              "
              aria-hidden="true"
            />

            <div>
              <p
                className="
                  text-sm font-semibold
                  text-sky-800
                  dark:text-sky-300
                "
              >
                Conservación del impacto
                histórico
              </p>

              <p
                className="
                  mt-1 text-sm leading-6
                  text-sky-700
                  dark:text-sky-400
                "
              >
                Cambiar un factor solo afecta
                a las recolecciones futuras.
                Los registros anteriores
                conservan el factor con el que
                fueron guardados.
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
          <MaterialForm
            key={
              editingMaterial?.id ??
              "new-material"
            }
            initialMaterial={
              editingMaterial
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
          label="Materiales registrados"
          value={summary.total}
          isLoading={loading}
          accent="emerald"
          decimals={0}
          icon={
            <FiPackage
              aria-hidden="true"
            />
          }
          helper="Total del catálogo ambiental"
        />

        <StatCard
          label="Materiales activos"
          value={summary.active}
          isLoading={loading}
          accent="sky"
          decimals={0}
          icon={
            <FiCheckCircle
              aria-hidden="true"
            />
          }
          helper="Disponibles en nuevas recolecciones"
        />

        <StatCard
          label="Materiales inactivos"
          value={summary.inactive}
          isLoading={loading}
          accent="amber"
          decimals={0}
          icon={
            <FiXCircle
              aria-hidden="true"
            />
          }
          helper="Ocultos sin perder su historial"
        />

        <StatCard
          label="Factor promedio de CO₂"
          value={summary.averageFactor}
          unit="kg/kg"
          isLoading={loading}
          accent="violet"
          decimals={2}
          icon={
            <FiBarChart2
              aria-hidden="true"
            />
          }
          helper="Promedio de los factores configurados"
        />
      </section>

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
          <div className="flex items-start gap-3">
            <span
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                bg-emerald-100
                text-emerald-700
                dark:bg-emerald-900/40
                dark:text-emerald-300
              "
            >
              <FiFilter aria-hidden="true" />
            </span>

            <div>
              <Card.Title>
                Buscar y filtrar
              </Card.Title>

              <Card.Description className="mt-1">
                Encuentra materiales por
                nombre, factor o estado.
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

        <Card.Body
          className="
            grid gap-4 p-5
            md:grid-cols-[minmax(0,1fr)_220px]
          "
        >
          <Input
            id="materials-search"
            name="materialsSearch"
            aria-label="Buscar materiales"
            placeholder="Buscar por nombre o factor..."
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
            id="materials-status-filter"
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
            <div className="flex gap-3">
              <FiActivity
                className="
                  mt-0.5 shrink-0
                  text-red-600
                  dark:text-red-400
                "
                aria-hidden="true"
              />

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
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                void loadMaterials()
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
              Catálogo de materiales
            </Card.Title>

            <Card.Description className="mt-1">
              Factores usados para calcular el
              impacto de nuevas
              recolecciones.
            </Card.Description>
          </div>

          <Badge variant="secondary">
            {filteredMaterials.length.toLocaleString(
              "es-MX"
            )}

            {filteredMaterials.length === 1
              ? " resultado"
              : " resultados"}
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
                Material
              </Table.HeaderCell>

              <Table.HeaderCell align="right">
                Factor de CO₂
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
                      className="w-32"
                    />
                  </Table.Cell>

                  <Table.Cell align="right">
                    <Skeleton
                      variant="text"
                      className="ml-auto w-20"
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
              filteredMaterials.length ===
                0 && (
                <Table.Empty
                  colSpan={5}
                  icon={
                    <FiPackage
                      size={30}
                    />
                  }
                  title="No se encontraron materiales"
                  description="Prueba cambiando la búsqueda o el filtro seleccionado."
                />
              )}

            {!loading &&
              !errorMessage &&
              paginatedMaterials.map(
                (material) => {
                  const operationsLocked =
                    changingMaterialId !==
                    null;

                  return (
                    <Table.Row
                      key={material.id}
                      clickable
                    >
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <span
                            className="
                              flex h-9 w-9 shrink-0
                              items-center justify-center
                              rounded-lg
                              bg-emerald-100
                              text-emerald-700
                              dark:bg-emerald-900/40
                              dark:text-emerald-300
                            "
                          >
                            <FiPackage
                              aria-hidden="true"
                            />
                          </span>

                          <p
                            className="
                              font-medium
                              text-slate-800
                              dark:text-white
                            "
                          >
                            {material.name}
                          </p>
                        </div>
                      </Table.Cell>

                      <Table.Cell align="right">
                        <span
                          className="
                            font-semibold
                            text-slate-700
                            dark:text-slate-200
                          "
                        >
                          {formatCo2Factor(
                            material.co2Factor
                          )}
                        </span>

                        <span
                          className="
                            ml-1 text-xs
                            text-slate-400
                            dark:text-slate-500
                          "
                        >
                          kg/kg
                        </span>
                      </Table.Cell>

                      <Table.Cell className="min-w-44">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={
                              material.active
                            }
                            disabled={
                              operationsLocked
                            }
                            onChange={(checked) =>
                              void handleStatusChange(
                                material,
                                checked
                              )
                            }
                          />

                          <Badge
                            variant={
                              material.active
                                ? "success"
                                : "danger"
                            }
                            dot
                          >
                            {material.active
                              ? "Activo"
                              : "Inactivo"}
                          </Badge>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap">
                        {formatDate(
                          material.createdAt
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
                              material
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

      <div
        className="
          flex gap-3 rounded-xl
          border border-slate-200
          bg-slate-50 p-4
          text-slate-600
          dark:border-slate-700
          dark:bg-slate-900
          dark:text-slate-300
        "
      >
        <FiInfo
          className="
            mt-0.5 shrink-0
            text-slate-500
            dark:text-slate-400
          "
          aria-hidden="true"
        />

        <p className="text-xs leading-5">
          Los materiales no se eliminan.
          Desactívalos para ocultarlos del
          formulario de nuevas recolecciones
          sin perder sus registros ni su
          impacto histórico.
        </p>
      </div>
    </div>
  );
}

function sortMaterials(
  materials: Material[]
): Material[] {
  return [...materials].sort(
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

function formatCo2Factor(
  value: number
): string {
  return value.toLocaleString(
    "es-MX",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }
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