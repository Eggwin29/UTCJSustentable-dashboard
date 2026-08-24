import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  FiAlertTriangle,
  FiPackage,
  FiSave,
  FiX,
} from "react-icons/fi";

import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/ui/select";
import Textarea from "@/components/ui/textArea";
import {
  useToast,
} from "@/components/ui/toast/toast";

import {
  collectionsService,
} from "@/services/collectionsService";

import type {
  AcademicTerm,
} from "@/types/academicTerm";

import type {
  CollectionListItem,
} from "@/types/collection";

import type {
  Material,
} from "@/types/material";

interface CollectionFormProps {
  materials: Material[];
  academicTerms: AcademicTerm[];
  userId: string;

  initialCollection?:
    | CollectionListItem
    | null;

  onSaved: (
    collection: CollectionListItem
  ) => void;

  onCancel: () => void;
}

interface FormState {
  date: string;
  academicTermId: string;
  materialId: string;
  kilograms: string;
  location: string;
  notes: string;
}

interface FormErrors {
  date?: string;
  academicTermId?: string;
  materialId?: string;
  kilograms?: string;
}

function getInitialForm(
  collection:
    | CollectionListItem
    | null
    | undefined,
  academicTerms: AcademicTerm[]
): FormState {
  if (collection) {
    return {
      date: collection.date,

      academicTermId:
        collection.academicTermId ?? "",

      materialId:
        collection.materialId,

      kilograms:
        collection.kilograms.toString(),

      location:
        collection.location ?? "",

      notes:
        collection.notes ?? "",
    };
  }

  const currentAcademicTerm =
    academicTerms.find(
      (academicTerm) =>
        academicTerm.isCurrent
    );

  return {
    date: getLocalDate(),

    academicTermId:
      currentAcademicTerm?.id ?? "",

    materialId: "",
    kilograms: "",
    location: "",
    notes: "",
  };
}

export default function CollectionForm({
  materials,
  academicTerms,
  userId,
  initialCollection,
  onSaved,
  onCancel,
}: CollectionFormProps) {
  const { toast } = useToast();

  const isEditing =
    Boolean(initialCollection);

  const [form, setForm] =
    useState<FormState>(() =>
      getInitialForm(
        initialCollection,
        academicTerms
      )
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const materialOptions = useMemo(
    () =>
      materials.map((material) => ({
        value: material.id,
        label: material.name,
      })),
    [materials]
  );

  const academicTermOptions = useMemo(
    () =>
      academicTerms.map(
        (academicTerm) => ({
          value: academicTerm.id,

          label:
            academicTerm.isCurrent
              ? `${academicTerm.label} (Actual)`
              : academicTerm.label,
        })
      ),
    [academicTerms]
  );

  const selectedAcademicTerm =
    useMemo(
      () =>
        academicTerms.find(
          (academicTerm) =>
            academicTerm.id ===
            form.academicTermId
        ) ?? null,
      [
        academicTerms,
        form.academicTermId,
      ]
    );

  const dateOutsideAcademicTerm =
    Boolean(
      form.date &&
        selectedAcademicTerm &&
        (form.date <
          selectedAcademicTerm.startDate ||
          form.date >
            selectedAcademicTerm.endDate)
    );

  const updateField = <
    K extends keyof FormState,
  >(
    field: K,
    value: FormState[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (field in errors) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.date) {
      nextErrors.date =
        "Selecciona una fecha.";
    }

    if (!form.academicTermId) {
      nextErrors.academicTermId =
        "Selecciona un cuatrimestre.";
    }

    if (!form.materialId) {
      nextErrors.materialId =
        "Selecciona un material.";
    }

    const kilograms =
      Number(form.kilograms);

    if (!form.kilograms) {
      nextErrors.kilograms =
        "Ingresa el peso recolectado.";
    } else if (
      !Number.isFinite(kilograms) ||
      kilograms <= 0
    ) {
      nextErrors.kilograms =
        "El peso debe ser un número mayor que cero.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length ===
      0
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const input = {
      date: form.date,

      academicTermId:
        form.academicTermId,

      materialId:
        form.materialId,

      kilograms:
        Number(form.kilograms),

      location:
        form.location,

      notes:
        form.notes,
    };

    try {
      const collection =
        initialCollection
          ? await collectionsService.update(
              initialCollection.id,
              input
            )
          : await collectionsService.create({
              ...input,
              createdBy: userId,
            });

      onSaved(collection);

      toast.success({
        title: isEditing
          ? "Recolección actualizada"
          : "Recolección registrada",

        description:
          `${collection.materialName}: ` +
          `${collection.kilograms} kg · ` +
          `${collection.academicTermLabel}.`,
      });
    } catch (error) {
      console.error(
        isEditing
          ? "Error actualizando recolección:"
          : "Error creando recolección:",
        error
      );

      toast.error({
        title: isEditing
          ? "No se pudo actualizar"
          : "No se pudo registrar",

        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un problema al guardar la recolección.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
        relative overflow-hidden
        rounded-2xl border
        border-slate-200 bg-white
        shadow-sm
        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      <span
        aria-hidden="true"
        className="
          absolute inset-x-0 top-0 h-1
          bg-linear-to-r
          from-emerald-600
          via-emerald-500
          to-teal-400
        "
      />

      <div
        className="
          flex items-start
          justify-between gap-4
          border-b border-slate-100
          p-5 pt-6
          dark:border-slate-800
          sm:p-6 sm:pt-7
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl bg-emerald-100
              text-xl text-emerald-700
              dark:bg-emerald-500/10
              dark:text-emerald-400
            "
          >
            <FiPackage aria-hidden="true" />
          </div>

          <div>
            <h2
              className="
                text-lg font-semibold
                text-slate-800
                dark:text-white
              "
            >
              {isEditing
                ? "Editar recolección"
                : "Nueva recolección"}
            </h2>

            <p
              className="
                mt-1 text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              {isEditing
                ? "Modifica la información del registro seleccionado."
                : "Registra una nueva entrada de residuos recolectados."}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<FiX />}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>

      <div
        className="
          grid gap-5 p-5
          sm:p-6
          md:grid-cols-2
        "
      >
        <Input
          id="collection-date"
          name="collectionDate"
          type="date"
          label="Fecha"
          value={form.date}
          onChange={(event) =>
            updateField(
              "date",
              event.target.value
            )
          }
          error={errors.date}
          disabled={isSubmitting}
        />

        <Dropdown
          id="collection-academic-term"
          label="Cuatrimestre"
          placeholder="Selecciona un cuatrimestre"
          options={academicTermOptions}
          value={form.academicTermId}
          onChange={(value) =>
            updateField(
              "academicTermId",
              String(value)
            )
          }
          error={errors.academicTermId}
          helperText="El periodo actual se selecciona automáticamente."
          disabled={isSubmitting}
        />

        <Dropdown
          id="collection-material"
          label="Material"
          placeholder="Selecciona un material"
          options={materialOptions}
          value={form.materialId}
          onChange={(value) =>
            updateField(
              "materialId",
              String(value)
            )
          }
          error={errors.materialId}
          disabled={isSubmitting}
        />

        <Input
          id="collection-kilograms"
          name="collectionKilograms"
          type="number"
          label="Kilogramos"
          placeholder="Ej. 42.5"
          min="0.001"
          step="0.001"
          value={form.kilograms}
          onChange={(event) =>
            updateField(
              "kilograms",
              event.target.value
            )
          }
          error={errors.kilograms}
          disabled={isSubmitting}
        />

        <div className="md:col-span-2">
          <Input
            id="collection-location"
            name="collectionLocation"
            label="Ubicación"
            placeholder="Ej. Edificio A"
            value={form.location}
            onChange={(event) =>
              updateField(
                "location",
                event.target.value
              )
            }
            helperText="Opcional"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {dateOutsideAcademicTerm &&
        selectedAcademicTerm && (
          <div
            className="
              mx-5 flex gap-3
              rounded-xl border
              border-amber-200
              bg-amber-50 p-4
              text-amber-800
              dark:border-amber-900/60
              dark:bg-amber-950/30
              dark:text-amber-300
              sm:mx-6
            "
          >
            <FiAlertTriangle
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold">
                Fecha fuera del cuatrimestre
              </p>

              <p className="mt-1 text-sm">
                {selectedAcademicTerm.label}

                {" comprende del "}

                {formatTermDate(
                  selectedAcademicTerm.startDate
                )}

                {" al "}

                {formatTermDate(
                  selectedAcademicTerm.endDate
                )}

                {
                  ". Puedes guardar el registro si esta asignación es intencional."
                }
              </p>
            </div>
          </div>
        )}

      <div
        className="
          px-5 pb-5 pt-5
          sm:px-6 sm:pb-6
        "
      >
        <Textarea
          id="collection-notes"
          name="collectionNotes"
          label="Observaciones"
          placeholder="Información adicional sobre la recolección..."
          rows={3}
          value={form.notes}
          onChange={(event) =>
            updateField(
              "notes",
              event.target.value
            )
          }
          helperText="Opcional"
          disabled={isSubmitting}
        />
      </div>

      <div
        className="
          flex flex-col-reverse gap-3
          border-t border-slate-100
          bg-slate-50/70 p-5
          dark:border-slate-800
          dark:bg-slate-950/35
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        "
      >
        <p
          className="
            text-xs text-slate-500
            dark:text-slate-400
          "
        >
          Los campos marcados por el
          formulario son necesarios para
          guardar el registro.
        </p>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            loading={isSubmitting}
            leftIcon={<FiSave />}
          >
            {isEditing
              ? "Guardar cambios"
              : "Guardar recolección"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function getLocalDate(): string {
  const date = new Date();

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTermDate(
  date: string
): string {
  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(
    new Date(`${date}T00:00:00Z`)
  );
}