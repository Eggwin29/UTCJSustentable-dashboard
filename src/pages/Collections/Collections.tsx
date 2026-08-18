import {
  useEffect,
  useState,
} from "react";

import {
  FiEdit2,
  FiInbox,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import Button from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { useConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast/toast";

import CollectionForm from "@/components/forms/CollectionForm";

import { collectionsService } from "@/services/collectionsService";
import { materialsService } from "@/services/materialsService";

import { useAuth } from "@/context/auth/useAuth";

import type { CollectionListItem } from "@/types/collection";
import type { Material } from "@/types/material";

export default function Collections() {
  const { user, profile } = useAuth();

  const confirm = useConfirmModal();
  const { toast } = useToast();

  const [collections, setCollections] =
    useState<CollectionListItem[]>([]);

  const [materials, setMaterials] =
    useState<Material[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [showForm, setShowForm] =
    useState(false);

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
  ] = useState<string | null>(null);

  // =====================================================
  // CARGAR INFORMACIÓN
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [
          collectionsData,
          materialsData,
        ] = await Promise.all([
          collectionsService.getAll(),
          materialsService.getActive(),
        ]);

        if (!cancelled) {
          setCollections(
            collectionsData
          );

          setMaterials(
            materialsData
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

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================================
  // ABRIR FORMULARIO DE CREACIÓN
  // =====================================================

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setShowForm(true);
  };

  // =====================================================
  // ABRIR FORMULARIO DE EDICIÓN
  // =====================================================

  const handleOpenEdit = (
    collection: CollectionListItem
  ) => {
    setEditingCollection(collection);
    setShowForm(true);
  };

  // =====================================================
  // CERRAR FORMULARIO
  // =====================================================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCollection(null);
  };

  // =====================================================
  // GUARDAR CREACIÓN O EDICIÓN
  // =====================================================

  const handleSaved = (
    collection: CollectionListItem
  ) => {
    if (editingCollection) {
      setCollections((current) =>
        current.map((item) =>
          item.id === collection.id
            ? collection
            : item
        )
      );
    } else {
      setCollections((current) => [
        collection,
        ...current,
      ]);
    }

    handleCloseForm();
  };

  // =====================================================
  // ELIMINAR RECOLECCIÓN
  // =====================================================

  const handleDelete = async (
    collection: CollectionListItem
  ) => {
    const confirmed = await confirm({
      title: "Eliminar recolección",
      description:
        `Se eliminará el registro de ${collection.materialName} ` +
        `(${formatKilograms(collection.kilograms)}). ` +
        "Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    setDeletingId(collection.id);

    try {
      await collectionsService.remove(
        collection.id
      );

      setCollections((current) =>
        current.filter(
          (item) =>
            item.id !== collection.id
        )
      );

      if (
        editingCollection?.id ===
        collection.id
      ) {
        handleCloseForm();
      }

      toast.success({
        title: "Recolección eliminada",
        description:
          "El registro fue eliminado correctamente.",
      });
    } catch (error) {
      console.error(
        "Error eliminando recolección:",
        error
      );

      toast.error({
        title: "No se pudo eliminar",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un problema al eliminar el registro.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // CARGANDO
  // =====================================================

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">
          Cargando colecciones...
        </p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (errorMessage) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">
          {errorMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ENCABEZADO */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Colecciones
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Registro y administración de residuos recolectados.
          </p>
        </div>

        {!showForm && (
          <Button
            leftIcon={<FiPlus />}
            onClick={handleOpenCreate}
          >
            Nueva recolección
          </Button>
        )}
      </div>

      {/* FORMULARIO */}

      {showForm && user && (
        <CollectionForm
          key={
            editingCollection?.id ??
            "new-collection"
          }
          materials={materials}
          userId={user.id}
          initialCollection={
            editingCollection
          }
          onSaved={handleSaved}
          onCancel={handleCloseForm}
        />
      )}

      {/* RESUMEN */}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Recolecciones registradas
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {collections.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">
            Materiales activos
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-800">
            {materials.length}
          </p>
        </div>
      </div>

      {/* TABLA */}

      <div>
        <div className="mb-3">
          <h2 className="font-semibold text-slate-800">
            Historial de recolecciones
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Registros almacenados en UTCJ Sustentable.
          </p>
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
            {collections.length === 0 ? (
              <Table.Empty
                colSpan={6}
                icon={<FiInbox size={30} />}
                title="No hay recolecciones"
                description="Registra la primera recolección para comenzar a generar información."
              />
            ) : (
              collections.map(
                (collection) => {
                  const canManage =
                    profile?.role ===
                      "admin" ||
                    collection.createdBy ===
                      user?.id;

                  return (
                    <Table.Row
                      key={collection.id}
                    >
                      <Table.Cell>
                        {formatDate(
                          collection.date
                        )}
                      </Table.Cell>

                      <Table.Cell>
                        <span className="font-medium text-slate-800">
                          {
                            collection.materialName
                          }
                        </span>
                      </Table.Cell>

                      <Table.Cell align="right">
                        <span className="font-semibold">
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
                        <span className="block max-w-xs truncate">
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
                                <FiEdit2 />
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
                                <FiTrash2 />
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
                                handleDelete(
                                  collection
                                )
                              }
                            >
                              Eliminar
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
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
      </div>
    </div>
  );
}

function formatDate(date: string) {
  const [year, month, day] =
    date.split("-");

  return `${day}/${month}/${year}`;
}

function formatKilograms(
  kilograms: number
) {
  return (
    new Intl.NumberFormat("es-MX", {
      maximumFractionDigits: 3,
    }).format(kilograms) + " kg"
  );
}