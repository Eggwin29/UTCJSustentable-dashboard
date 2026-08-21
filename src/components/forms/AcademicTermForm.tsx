import {
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

import {
  useToast,
} from "@/components/ui/toast/toast";

import {
  academicTermsService,
  getDefaultAcademicTermDates,
} from "@/services/academicTermsService";

import type {
  AcademicTerm,
  AcademicTermCode,
} from "@/types/academicTerm";

interface AcademicTermFormProps {
  initialAcademicTerm?:
    | AcademicTerm
    | null;

  onSaved: (
    academicTerm: AcademicTerm
  ) => void;

  onCancel: () => void;
}

interface FormState {
  year: string;
  term: AcademicTermCode;
  startDate: string;
  endDate: string;
}

interface FormErrors {
  year?: string;
  startDate?: string;
  endDate?: string;
}

const termOptions = [
  {
    value: "E-A",
    label: "Enero - Abril",
  },
  {
    value: "M-A",
    label: "Mayo - Agosto",
  },
  {
    value: "S-D",
    label: "Septiembre - Diciembre",
  },
];

export default function AcademicTermForm({
  initialAcademicTerm,
  onSaved,
  onCancel,
}: AcademicTermFormProps) {
  const { toast } = useToast();

  const [form, setForm] =
    useState<FormState>(() =>
      getInitialForm(
        initialAcademicTerm
      )
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const updatePeriod = (
    yearValue: string,
    term: AcademicTermCode
  ) => {
    const year = Number(yearValue);

    const dates =
      Number.isInteger(year) &&
      year >= 2022 &&
      year <= 2100
        ? getDefaultAcademicTermDates(
            term,
            year
          )
        : {
            startDate: "",
            endDate: "",
          };

    setForm((current) => ({
      ...current,
      year: yearValue,
      term,
      ...dates,
    }));

    setErrors({});
  };

  const updateDate = (
    field: "startDate" | "endDate",
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const validate = () => {
    const nextErrors: FormErrors =
      {};

    const year = Number(form.year);

    if (
      !Number.isInteger(year) ||
      year < 2022 ||
      year > 2100
    ) {
      nextErrors.year =
        "Ingresa un año entre 2022 y 2100.";
    }

    if (!form.startDate) {
      nextErrors.startDate =
        "Selecciona la fecha inicial.";
    } else if (
      Number.isInteger(year) &&
      !form.startDate.startsWith(
        `${year}-`
      )
    ) {
      nextErrors.startDate =
        "La fecha debe pertenecer al año seleccionado.";
    }

    if (!form.endDate) {
      nextErrors.endDate =
        "Selecciona la fecha final.";
    } else if (
      Number.isInteger(year) &&
      !form.endDate.startsWith(
        `${year}-`
      )
    ) {
      nextErrors.endDate =
        "La fecha debe pertenecer al año seleccionado.";
    } else if (
      form.startDate &&
      form.startDate > form.endDate
    ) {
      nextErrors.endDate =
        "La fecha final debe ser posterior a la inicial.";
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
        year: Number(form.year),
        term: form.term,
        startDate: form.startDate,
        endDate: form.endDate,
      };

      const savedAcademicTerm =
        initialAcademicTerm
          ? await academicTermsService.update(
              initialAcademicTerm.id,
              input
            )
          : await academicTermsService.create(
              input
            );

      onSaved(savedAcademicTerm);

      toast.success({
        title: initialAcademicTerm
          ? "Cuatrimestre actualizado"
          : "Cuatrimestre creado",

        description:
          `${savedAcademicTerm.label} fue guardado correctamente.`,
      });
    } catch (error) {
      console.error(
        "Error al guardar el cuatrimestre:",
        error
      );

      toast.error({
        title:
          "No se pudo guardar el cuatrimestre",

        description:
          getAcademicTermErrorMessage(
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
                {initialAcademicTerm
                  ? "Editar cuatrimestre"
                  : "Nuevo cuatrimestre"}
              </Card.Title>

              <Card.Description>
                Define el año, periodo y
                rango de fechas que
                agruparán los registros.
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
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              type="number"
              label="Año"
              min="2022"
              max="2100"
              step="1"
              value={form.year}
              onChange={(event) =>
                updatePeriod(
                  event.target.value,
                  form.term
                )
              }
              error={errors.year}
              disabled={submitting}
              autoFocus
            />

            <Dropdown
              label="Periodo"
              options={termOptions}
              value={form.term}
              onChange={(value) =>
                updatePeriod(
                  form.year,
                  value as AcademicTermCode
                )
              }
              disabled={submitting}
            />

            <Input
              type="date"
              label="Fecha inicial"
              value={form.startDate}
              onChange={(event) =>
                updateDate(
                  "startDate",
                  event.target.value
                )
              }
              error={errors.startDate}
              disabled={submitting}
            />

            <Input
              type="date"
              label="Fecha final"
              value={form.endDate}
              onChange={(event) =>
                updateDate(
                  "endDate",
                  event.target.value
                )
              }
              error={errors.endDate}
              disabled={submitting}
            />
          </div>
        </Card.Body>

        <Card.Footer className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
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
            Guardar cuatrimestre
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
}

function getInitialForm(
  initialAcademicTerm?:
    | AcademicTerm
    | null
): FormState {
  if (initialAcademicTerm) {
    return {
      year: String(
        initialAcademicTerm.year
      ),

      term:
        initialAcademicTerm.term,

      startDate:
        initialAcademicTerm.startDate,

      endDate:
        initialAcademicTerm.endDate,
    };
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const term: AcademicTermCode =
    month <= 4
      ? "E-A"
      : month <= 8
        ? "M-A"
        : "S-D";

  return {
    year: String(year),
    term,

    ...getDefaultAcademicTermDates(
      term,
      year
    ),
  };
}

function getAcademicTermErrorMessage(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    return "Ya existe ese cuatrimestre.";
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