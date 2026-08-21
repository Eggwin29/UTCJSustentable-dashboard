import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  FiSave,
  FiX,
} from "react-icons/fi";

import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/ui/select";
import Textarea from "@/components/ui/textArea";

import {
  useToast,
} from "@/components/ui/toast/toast";

import {
  humanCapitalService,
} from "@/services/humanCapitalService";

import type {
  AcademicTerm,
} from "@/types/academicTerm";

import type {
  HumanCapitalRecord,
} from "@/types/humanCapital";

interface HumanCapitalFormProps {
  academicTerms: AcademicTerm[];

  initialRecord?:
    | HumanCapitalRecord
    | null;

  onSaved: (
    record: HumanCapitalRecord
  ) => void;

  onCancel: () => void;
}

interface FormState {
  academicTermId: string;
  tmTuesday: string;
  tvThursday: string;
  notes: string;
}

interface FormErrors {
  academicTermId?: string;
  tmTuesday?: string;
  tvThursday?: string;
  notes?: string;
}

export default function HumanCapitalForm({
  academicTerms,
  initialRecord,
  onSaved,
  onCancel,
}: HumanCapitalFormProps) {
  const { toast } = useToast();

  const [form, setForm] =
    useState<FormState>(() =>
      getInitialForm(
        initialRecord,
        academicTerms
      )
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const academicTermOptions =
    useMemo(
      () =>
        academicTerms.map(
          (academicTerm) => ({
            value:
              academicTerm.id,

            label:
              academicTerm.isCurrent
                ? `${academicTerm.label} (Actual)`
                : academicTerm.label,
          })
        ),
      [academicTerms]
    );

  const totalParticipants =
    getParticipantValue(
      form.tmTuesday
    ) +
    getParticipantValue(
      form.tvThursday
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
    const nextErrors: FormErrors =
      {};

    if (!form.academicTermId) {
      nextErrors.academicTermId =
        "Selecciona un cuatrimestre.";
    }

    validateParticipants(
      form.tmTuesday,
      "T.M. Martes",
      (message) => {
        nextErrors.tmTuesday =
          message;
      }
    );

    validateParticipants(
      form.tvThursday,
      "T.V. Jueves",
      (message) => {
        nextErrors.tvThursday =
          message;
      }
    );

    if (
      form.notes.length > 1000
    ) {
      nextErrors.notes =
        "Las observaciones no pueden superar los 1000 caracteres.";
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

    try {
      setSubmitting(true);

      const input = {
        academicTermId:
          form.academicTermId,

        tmTuesday:
          Number(form.tmTuesday),

        tvThursday:
          Number(form.tvThursday),

        notes:
          form.notes,
      };

      const savedRecord =
        initialRecord
          ? await humanCapitalService.update(
              initialRecord.id,
              input
            )
          : await humanCapitalService.create(
              input
            );

      onSaved(savedRecord);

      toast.success({
        title: initialRecord
          ? "Participación actualizada"
          : "Participación registrada",

        description:
          `${savedRecord.academicTermLabel}: ` +
          `${savedRecord.totalParticipants} participaciones.`,
      });
    } catch (error) {
      console.error(
        "Error al guardar Capital humano:",
        error
      );

      toast.error({
        title:
          "No se pudo guardar la participación",

        description:
          getHumanCapitalErrorMessage(
            error
          ),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="outlined">
      <form onSubmit={handleSubmit}>
        <Card.Header>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Card.Title>
                {initialRecord
                  ? "Editar Capital humano"
                  : "Registrar Capital humano"}
              </Card.Title>

              <Card.Description>
                Registra el resultado
                agregado de participación
                para un solo cuatrimestre.
              </Card.Description>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<FiX />}
              onClick={onCancel}
              disabled={submitting}
            >
              Cerrar
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          <div className="grid gap-5 md:grid-cols-3">
            <Dropdown
              label="Cuatrimestre"
              placeholder="Selecciona un cuatrimestre"
              options={
                academicTermOptions
              }
              value={
                form.academicTermId
              }
              onChange={(value) =>
                updateField(
                  "academicTermId",
                  String(value)
                )
              }
              error={
                errors.academicTermId
              }
              disabled={submitting}
            />

            <Input
              type="number"
              label="T.M. Martes"
              placeholder="Ej. 50"
              min="0"
              max="1000000"
              step="1"
              value={form.tmTuesday}
              onChange={(event) =>
                updateField(
                  "tmTuesday",
                  event.target.value
                )
              }
              error={errors.tmTuesday}
              disabled={submitting}
            />

            <Input
              type="number"
              label="T.V. Jueves"
              placeholder="Ej. 40"
              min="0"
              max="1000000"
              step="1"
              value={form.tvThursday}
              onChange={(event) =>
                updateField(
                  "tvThursday",
                  event.target.value
                )
              }
              error={
                errors.tvThursday
              }
              disabled={submitting}
            />
          </div>

          <div className="mt-5">
            <Textarea
              label="Observaciones"
              placeholder="Información adicional del cuatrimestre..."
              rows={3}
              value={form.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value
                )
              }
              error={errors.notes}
              helperText={`${form.notes.length}/1000 caracteres · Opcional`}
              maxLength={1000}
              disabled={submitting}
            />
          </div>

          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Total del cuatrimestre
            </p>

            <p className="mt-1 text-3xl font-bold text-emerald-800 dark:text-emerald-200">
              {totalParticipants.toLocaleString(
                "es-MX"
              )}
            </p>
          </div>
        </Card.Body>

        <Card.Footer className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            leftIcon={<FiSave />}
            loading={submitting}
          >
            Guardar participación
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
}

function getInitialForm(
  initialRecord:
    | HumanCapitalRecord
    | null
    | undefined,

  academicTerms: AcademicTerm[]
): FormState {
  if (initialRecord) {
    return {
      academicTermId:
        initialRecord.academicTermId,

      tmTuesday:
        String(
          initialRecord.tmTuesday
        ),

      tvThursday:
        String(
          initialRecord.tvThursday
        ),

      notes:
        initialRecord.notes ?? "",
    };
  }

  const defaultAcademicTerm =
    academicTerms.find(
      (academicTerm) =>
        academicTerm.isCurrent
    ) ?? academicTerms[0];

  return {
    academicTermId:
      defaultAcademicTerm?.id ?? "",

    tmTuesday: "",
    tvThursday: "",
    notes: "",
  };
}

function getParticipantValue(
  value: string
): number {
  const parsedValue =
    Number(value);

  return (
    Number.isInteger(parsedValue) &&
    parsedValue >= 0
  )
    ? parsedValue
    : 0;
}

function validateParticipants(
  value: string,
  label: string,
  setError: (
    message: string
  ) => void
): void {
  if (value.trim() === "") {
    setError(
      `Ingresa la cantidad de ${label}.`
    );

    return;
  }

  const parsedValue =
    Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 0
  ) {
    setError(
      "La cantidad debe ser un número entero mayor o igual a cero."
    );

    return;
  }

  if (parsedValue > 1000000) {
    setError(
      "La cantidad supera el valor permitido."
    );
  }
}

function getHumanCapitalErrorMessage(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    return "Ese cuatrimestre ya tiene un registro de Capital humano.";
  }

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