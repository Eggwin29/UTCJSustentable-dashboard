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

interface InternshipParticipationFormProps {
  academicTerms: AcademicTerm[];
  academicPrograms: AcademicProgram[];

  initialRecord?:
    | InternshipParticipationRecord
    | null;

  onSaved: (
    record: InternshipParticipationRecord
  ) => void;

  onCancel: () => void;
}

interface FormState {
  academicTermId: string;
  academicProgramId: string;
  academicLevel: AcademicLevel | "";
  participantCount: string;
  notes: string;
}

interface FormErrors {
  academicTermId?: string;
  academicProgramId?: string;
  academicLevel?: string;
  participantCount?: string;
  notes?: string;
}

const ACADEMIC_LEVEL_OPTIONS = [
  {
    value: "TSU",
    label: "TSU",
  },
  {
    value: "Licenciatura",
    label: "Licenciatura",
  },
  {
    value: "Sin especificar",
    label: "Sin especificar",
  },
];

export default function InternshipParticipationForm({
  academicTerms,
  academicPrograms,
  initialRecord,
  onSaved,
  onCancel,
}: InternshipParticipationFormProps) {
  const { toast } = useToast();

  const [form, setForm] =
    useState<FormState>(() =>
      getInitialForm(
        initialRecord,
        academicTerms,
        academicPrograms
      )
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [submitting, setSubmitting] =
    useState(false);

  const academicTermOptions = useMemo(
    () =>
      academicTerms.map(
        (academicTerm) => ({
          value: academicTerm.id,

          label: academicTerm.isCurrent
            ? `${academicTerm.label} (Actual)`
            : academicTerm.label,
        })
      ),
    [academicTerms]
  );

  const academicProgramOptions = useMemo(
    () =>
      academicPrograms.map(
        (academicProgram) => ({
          value: academicProgram.id,
          label: academicProgram.name,
        })
      ),
    [academicPrograms]
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

    if (!form.academicTermId) {
      nextErrors.academicTermId =
        "Selecciona un cuatrimestre.";
    }

    if (!form.academicProgramId) {
      nextErrors.academicProgramId =
        "Selecciona una carrera.";
    }

    if (!form.academicLevel) {
      nextErrors.academicLevel =
        "Selecciona un nivel académico.";
    }

    validateParticipantCount(
      form.participantCount,
      (message) => {
        nextErrors.participantCount =
          message;
      }
    );

    if (form.notes.length > 1000) {
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

    if (!form.academicLevel) {
      return;
    }

    try {
      setSubmitting(true);

      const input = {
        academicTermId:
          form.academicTermId,

        academicProgramId:
          form.academicProgramId,

        academicLevel:
          form.academicLevel,

        participantCount:
          Number(form.participantCount),

        notes:
          form.notes,
      };

      const savedRecord =
        initialRecord
          ? await internshipParticipationService.update(
              initialRecord.id,
              input
            )
          : await internshipParticipationService.create(
              input
            );

      onSaved(savedRecord);

      toast.success({
        title: initialRecord
          ? "Participación actualizada"
          : "Participación registrada",

        description:
          `${savedRecord.academicTermLabel} · ` +
          `${savedRecord.academicProgramName} · ` +
          `${savedRecord.academicLevel}: ` +
          `${savedRecord.participantCount.toLocaleString(
            "es-MX"
          )} participaciones.`,
      });
    } catch (error) {
      console.error(
        "Error al guardar Capital estadías:",
        error
      );

      toast.error({
        title:
          "No se pudo guardar la participación",

        description:
          getInternshipErrorMessage(
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
                  ? "Editar Capital estadías"
                  : "Registrar Capital estadías"}
              </Card.Title>

              <Card.Description>
                Registra la participación por
                cuatrimestre, carrera y nivel
                académico.
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
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Dropdown
              id="internship-academic-term"
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
              disabled={submitting}
            />

            <Dropdown
              id="internship-academic-program"
              label="Carrera"
              placeholder="Selecciona una carrera"
              options={academicProgramOptions}
              value={form.academicProgramId}
              onChange={(value) =>
                updateField(
                  "academicProgramId",
                  String(value)
                )
              }
              error={
                errors.academicProgramId
              }
              disabled={submitting}
            />

            <Dropdown
              id="internship-academic-level"
              label="Nivel académico"
              placeholder="Selecciona un nivel"
              options={
                ACADEMIC_LEVEL_OPTIONS
              }
              value={form.academicLevel}
              onChange={(value) =>
                updateField(
                  "academicLevel",
                  String(
                    value
                  ) as AcademicLevel
                )
              }
              error={errors.academicLevel}
              disabled={submitting}
            />

            <Input
              id="internship-participant-count"
              name="participantCount"
              type="number"
              label="Participantes"
              placeholder="Ej. 3"
              min="1"
              max="1000000"
              step="1"
              value={form.participantCount}
              onChange={(event) =>
                updateField(
                  "participantCount",
                  event.target.value
                )
              }
              error={
                errors.participantCount
              }
              disabled={submitting}
            />
          </div>

          <div className="mt-5">
            <Textarea
              id="internship-notes"
              name="notes"
              label="Observaciones"
              placeholder="Información adicional del registro..."
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
              Participación del registro
            </p>

            <p className="mt-1 text-3xl font-bold text-emerald-800 dark:text-emerald-200">
              {getParticipantValue(
                form.participantCount
              ).toLocaleString("es-MX")}
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
    | InternshipParticipationRecord
    | null
    | undefined,

  academicTerms: AcademicTerm[],
  academicPrograms: AcademicProgram[]
): FormState {
  if (initialRecord) {
    return {
      academicTermId:
        initialRecord.academicTermId,

      academicProgramId:
        initialRecord.academicProgramId,

      academicLevel:
        initialRecord.academicLevel,

      participantCount:
        String(
          initialRecord.participantCount
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

    academicProgramId:
      academicPrograms[0]?.id ?? "",

    academicLevel: "",
    participantCount: "",
    notes: "",
  };
}

function getParticipantValue(
  value: string
): number {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) &&
    parsedValue >= 1
    ? parsedValue
    : 0;
}

function validateParticipantCount(
  value: string,
  setError: (message: string) => void
): void {
  if (value.trim() === "") {
    setError(
      "Ingresa la cantidad de participantes."
    );
    return;
  }

  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1
  ) {
    setError(
      "La cantidad debe ser un número entero mayor que cero."
    );
    return;
  }

  if (parsedValue > 1000000) {
    setError(
      "La cantidad supera el valor permitido."
    );
  }
}

function getInternshipErrorMessage(
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