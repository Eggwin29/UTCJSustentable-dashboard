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
import {
  useToast,
} from "@/components/ui/toast/toast";

import {
  academicProgramsService,
} from "@/services/academicProgramsService";

import type {
  AcademicProgram,
} from "@/types/internshipParticipation";

interface AcademicProgramFormProps {
  initialAcademicProgram?: AcademicProgram | null;

  onSaved: (
    academicProgram: AcademicProgram
  ) => void;

  onCancel: () => void;
}

interface FormErrors {
  name?: string;
}

export default function AcademicProgramForm({
  initialAcademicProgram,
  onSaved,
  onCancel,
}: AcademicProgramFormProps) {
  const { toast } = useToast();

  const [name, setName] = useState(
    initialAcademicProgram?.name ?? ""
  );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [submitting, setSubmitting] =
    useState(false);

  const handleNameChange = (
    value: string
  ) => {
    setName(value);

    if (errors.name) {
      setErrors({});
    }
  };

  const validate = (): boolean => {
    const normalizedName = name.trim();

    if (!normalizedName) {
      setErrors({
        name: "Ingresa el nombre de la carrera.",
      });

      return false;
    }

    if (normalizedName.length < 2) {
      setErrors({
        name: "El nombre debe contener al menos 2 caracteres.",
      });

      return false;
    }

    if (normalizedName.length > 120) {
      setErrors({
        name: "El nombre no puede superar los 120 caracteres.",
      });

      return false;
    }

    setErrors({});

    return true;
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
        name,
      };

      const savedAcademicProgram =
        initialAcademicProgram
          ? await academicProgramsService.update(
              initialAcademicProgram.id,
              input
            )
          : await academicProgramsService.create(
              input
            );

      onSaved(savedAcademicProgram);

      toast.success({
        title: initialAcademicProgram
          ? "Carrera actualizada"
          : "Carrera creada",

        description: `${savedAcademicProgram.name} fue guardada correctamente.`,
      });
    } catch (error) {
      console.error(
        "Error al guardar la carrera:",
        error
      );

      toast.error({
        title:
          "No se pudo guardar la carrera",
        description:
          getErrorMessage(error),
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
                {initialAcademicProgram
                  ? "Editar carrera"
                  : "Nueva carrera"}
              </Card.Title>

              <Card.Description>
                Las carreras activas estarán disponibles al registrar Capital estadías.
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
          <Input
            id="academic-program-name"
            name="academicProgramName"
            label="Nombre de la carrera"
            placeholder="Ej. Tecnologías de la Información"
            value={name}
            onChange={(event) =>
              handleNameChange(
                event.target.value
              )
            }
            error={errors.name}
            helperText="Nombre que aparecerá en formularios y reportes."
            disabled={submitting}
            maxLength={120}
            autoComplete="off"
            autoFocus
          />
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
            loading={submitting}
            leftIcon={<FiSave />}
          >
            {initialAcademicProgram
              ? "Guardar cambios"
              : "Crear carrera"}
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
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