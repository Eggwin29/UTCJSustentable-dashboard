import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCheckCircle,
  FiKey,
  FiLock,
} from "react-icons/fi";

import {
  useNavigate,
} from "react-router-dom";

import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input/Input";
import Spinner from "@/components/ui/spinner/Spinner";

import {
  supabase,
} from "@/lib/supabase";

import {
  authService,
} from "@/services/authService";

import {
  passwordRecoveryState,
} from "@/utils/passwordRecovery";

type LinkStatus =
  | "checking"
  | "valid"
  | "invalid";

export default function ResetPassword() {
  const navigate = useNavigate();

  const recoveryDetectedRef =
    useRef(false);

  const [
    linkStatus,
    setLinkStatus,
  ] = useState<LinkStatus>("checking");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isLeaving,
    setIsLeaving,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    recoveryDetectedRef.current =
      passwordRecoveryState.isActive();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!mounted) {
          return;
        }

        if (
          event ===
            "PASSWORD_RECOVERY" &&
          nextSession
        ) {
          recoveryDetectedRef.current =
            true;

          passwordRecoveryState.activate();
          setLinkStatus("valid");
        }
      }
    );

    async function validateRecovery() {
      const {
        data: { session },
        error,
      } =
        await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      const recoveryIsActive =
        recoveryDetectedRef.current ||
        passwordRecoveryState.isActive();

      if (
        !error &&
        session &&
        recoveryIsActive
      ) {
        setLinkStatus("valid");
        return;
      }

      if (!session) {
        passwordRecoveryState.clear();
      }

      setLinkStatus("invalid");
    }

    void validateRecovery();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage(
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setErrorMessage(
        "Las contraseñas no coinciden."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await authService
        .updateRecoveredPassword(
          newPassword
        );

      try {
        await authService.signOut();
        passwordRecoveryState.clear();
      } catch (signOutError) {
        console.error(
          "La contraseña cambió, pero no se pudo cerrar la sesión:",
          signOutError
        );
      }

      navigate(
        "/login?passwordUpdated=1",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "No se pudo restablecer la contraseña:",
        error
      );

      setErrorMessage(
        getRecoveryErrorMessage(error)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToLogin =
    async () => {
      setIsLeaving(true);

      try {
        await authService.signOut();
        passwordRecoveryState.clear();
      } catch (error) {
        console.error(
          "No se pudo cerrar la sesión de recuperación:",
          error
        );
      } finally {
        navigate("/login", {
          replace: true,
        });
      }
    };

  if (linkStatus === "checking") {
    return (
      <AuthLayout
        title="Verificando enlace"
        description="Estamos validando tu solicitud de recuperación."
      >
        <div className="flex min-h-32 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </AuthLayout>
    );
  }

  if (linkStatus === "invalid") {
    return (
      <AuthLayout
        title="Enlace no disponible"
        description="No fue posible validar esta solicitud de recuperación."
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <FiAlertTriangle
              className="mt-0.5 shrink-0"
              size={20}
              aria-hidden="true"
            />

            <p className="text-sm leading-6">
              El enlace puede haber expirado,
              haber sido utilizado anteriormente
              o estar incompleto. Solicita uno
              nuevo para continuar.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            loading={isLeaving}
            onClick={() =>
              void handleReturnToLogin()
            }
            leftIcon={
              <FiArrowLeft
                aria-hidden="true"
              />
            }
            className="w-full"
          >
            Volver al inicio de sesión
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crear nueva contraseña"
      description="Elige una contraseña diferente para recuperar el acceso a tu cuenta."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <Input
          id="reset-new-password"
          name="newPassword"
          type="password"
          label="Nueva contraseña"
          value={newPassword}
          onChange={(event) =>
            setNewPassword(
              event.target.value
            )
          }
          helperText="Utiliza al menos 8 caracteres."
          leftIcon={
            <FiKey aria-hidden="true" />
          }
          autoComplete="new-password"
          minLength={8}
          showPasswordToggle
          required
          disabled={isSubmitting}
        />

        <Input
          id="reset-confirm-password"
          name="confirmPassword"
          type="password"
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(
              event.target.value
            )
          }
          leftIcon={
            <FiLock aria-hidden="true" />
          }
          autoComplete="new-password"
          minLength={8}
          showPasswordToggle
          required
          disabled={isSubmitting}
        />

        {errorMessage && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          disabled={
            !newPassword ||
            !confirmPassword
          }
          leftIcon={
            <FiCheckCircle
              aria-hidden="true"
            />
          }
          className="w-full"
        >
          Guardar nueva contraseña
        </Button>
      </form>
    </AuthLayout>
  );
}

function getRecoveryErrorMessage(
  error: unknown
) {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : "";

  if (
    message.includes("same password") ||
    message.includes(
      "different from the old password"
    )
  ) {
    return "La contraseña nueva debe ser diferente de la anterior.";
  }

  if (
    message.includes("expired") ||
    message.includes("session") ||
    message.includes("token")
  ) {
    return "El enlace dejó de ser válido. Solicita uno nuevo e inténtalo nuevamente.";
  }

  return "No pudimos actualizar la contraseña. Revisa los datos e inténtalo nuevamente.";
}