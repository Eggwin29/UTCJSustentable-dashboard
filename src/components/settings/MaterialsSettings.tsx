import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiEdit2,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import MaterialForm from "@/components/forms/MaterialForm";

import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input/Input";
import Dropdown from "@/components/ui/select";
import Skeleton from "@/components/ui/skeleton/Skeleton";
import Switch from "@/components/ui/switch/Switch";
import { Table } from "@/components/ui/table";

import {
  useConfirmModal,
} from "@/components/ui/confirm-modal";

import {
  useToast,
} from "@/components/ui/toast/toast";

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
        if (!cancelled) {
          console.error(
            "Error al cargar materiales:",
            error
          );

          setErrorMessage(
            "No se pudieron cargar los materiales."
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

  const filteredMaterials =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLocaleLowerCase("es");

      return materials.filter(
        (material) => {
          const matchesSearch =
            !normalizedSearch ||
            material.name
              .toLocaleLowerCase("es")
              .includes(
                normalizedSearch
              );

          const matchesStatus =
            statusFilter === "all" ||
            (
              statusFilter === "active"
                ? material.active
                : !material.active
            );

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

  const activeMaterials =
    materials.filter(
      (material) => material.active
    ).length;

  const inactiveMaterials =
    materials.length - activeMaterials;

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
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Materiales
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Administra los materiales y
            sus factores de CO₂.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            leftIcon={<FiRefreshCw />}
            onClick={() =>
              void loadMaterials()
            }
            loading={loading}
          >
            Actualizar
          </Button>

          {!showForm && (
            <Button
              leftIcon={<FiPlus />}
              onClick={
                handleOpenCreate
              }
            >
              Nuevo material
            </Button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/30">
        <p className="text-sm font-medium text-sky-800 dark:text-sky-300">
          Conservación de datos históricos
        </p>

        <p className="mt-1 text-sm text-sky-700 dark:text-sky-400">
          Cambiar un factor de CO₂ solo
          afectará a las recolecciones
          futuras. Los registros anteriores
          conservarán el factor que tenían
          al momento de ser guardados.
        </p>
      </section>

      {showForm && (
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
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Materiales registrados"
          value={materials.length}
        />

        <SummaryCard
          label="Materiales activos"
          value={activeMaterials}
        />

        <SummaryCard
          label="Materiales inactivos"
          value={inactiveMaterials}
        />
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-[minmax(0,1fr)_220px]">
        <Input
          aria-label="Buscar materiales"
          placeholder="Buscar material..."
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
              void loadMaterials()
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
            filteredMaterials.map(
              (material) => {
                const operationsLocked =
                  changingMaterialId !==
                  null;

                return (
                  <Table.Row
                    key={material.id}
                  >
                    <Table.Cell>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {material.name}
                      </p>
                    </Table.Cell>

                    <Table.Cell align="right">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {formatCo2Factor(
                          material.co2Factor
                        )}
                      </span>

                      <span className="ml-1 text-xs text-slate-400">
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
                          onChange={(
                            checked
                          ) =>
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
                        size="sm"
                        variant="ghost"
                        leftIcon={
                          <FiEdit2 />
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

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Los materiales no se eliminan.
        Desactívalos para ocultarlos del
        formulario de nuevas recolecciones
        sin perder su historial.
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