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
  materialsService,
} from "@/services/materialsService";

import type {
  Material,
} from "@/types/material";

interface MaterialFormProps {
  initialMaterial?: Material | null;
  onSaved: (material: Material) => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  co2Factor: string;
}

interface FormErrors {
  name?: string;
  co2Factor?: string;
}

export default function MaterialForm({
  initialMaterial,
  onSaved,
  onCancel,
}: MaterialFormProps) {
  const { toast } = useToast();

  const [form, setForm] =
    useState<FormState>(() => ({
      name:
        initialMaterial?.name ?? "",

      co2Factor:
        initialMaterial
          ? String(
              initialMaterial.co2Factor
            )
          : "",
    }));

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [submitting, setSubmitting] =
    useState(false);

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

    const name = form.name.trim();

    const co2Factor =
      Number(form.co2Factor);

    if (!name) {
      nextErrors.name =
        "Ingresa el nombre del material.";
    } else if (name.length < 2) {
      nextErrors.name =
        "El nombre debe contener al menos 2 caracteres.";
    }

    if (
      form.co2Factor.trim() === ""
    ) {
      nextErrors.co2Factor =
        "Ingresa el factor de CO₂.";
    } else if (
      !Number.isFinite(co2Factor) ||
      co2Factor < 0
    ) {
      nextErrors.co2Factor =
        "El factor debe ser un número mayor o igual a cero.";
    } else if (
      co2Factor > 999999.9999
    ) {
      nextErrors.co2Factor =
        "El factor supera el valor permitido.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
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
        name: form.name,
        co2Factor:
          Number(form.co2Factor),
      };

      const savedMaterial =
        initialMaterial
          ? await materialsService.update(
              initialMaterial.id,
              input
            )
          : await materialsService.create(
              input
            );

      onSaved(savedMaterial);

      toast.success({
        title: initialMaterial
          ? "Material actualizado"
          : "Material creado",

        description:
          `${savedMaterial.name} fue guardado correctamente.`,
      });
    } catch (error) {
      console.error(
        "Error al guardar el material:",
        error
      );

      toast.error({
        title:
          "No se pudo guardar el material",

        description:
          getMaterialErrorMessage(error),
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
                {initialMaterial
                  ? "Editar material"
                  : "Nuevo material"}
              </Card.Title>

              <Card.Description>
                El factor representa los
                kilogramos de CO₂ evitados por
                cada kilogramo recolectado.
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
              label="Nombre del material"
              placeholder="Ej. Plástico"
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              error={errors.name}
              disabled={submitting}
              maxLength={80}
              autoFocus
            />

            <Input
              type="number"
              label="Factor de CO₂"
              placeholder="Ej. 1.5"
              min="0"
              max="999999.9999"
              step="0.0001"
              value={form.co2Factor}
              onChange={(event) =>
                updateField(
                  "co2Factor",
                  event.target.value
                )
              }
              error={errors.co2Factor}
              helperText="kg de CO₂ evitado por kg recolectado"
              disabled={submitting}
            />
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
            loading={submitting}
            leftIcon={<FiSave />}
          >
            {initialMaterial
              ? "Guardar cambios"
              : "Crear material"}
          </Button>
        </Card.Footer>
      </form>
    </Card>
  );
}

function getMaterialErrorMessage(
  error: unknown
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    return (
      "Ya existe un material con ese nombre."
    );
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