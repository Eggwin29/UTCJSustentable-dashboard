import {
  useState,
  type FormEvent,
} from "react";

import {
  FiArrowLeft,
  FiCheckCircle,
  FiMail,
} from "react-icons/fi";

import {
  Link,
  Navigate,
} from "react-router-dom";

import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input/Input";

import {
  useAuth,
} from "@/context/auth/useAuth";

import {
  authService,
} from "@/services/authService";

export default function ForgotPassword() {
  const {
    user,
    loading,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    requestCompleted,
    setRequestCompleted,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await authService.requestPasswordReset(
        email
      );

      setRequestCompleted(true);
    } catch (error) {
      console.error(
        "No se pudo solicitar la recuperación:",
        error
      );

      setErrorMessage(
        "No pudimos enviar el correo en este momento. Espera unos minutos e inténtalo nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loading && user) {
    return (
      <Navigate
        to="/perfil"
        replace
      />
    );
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      description="Te enviaremos un enlace seguro para crear una contraseña nueva."
    >
      {requestCompleted ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
            <div className="flex items-start gap-3">
              <FiCheckCircle
                className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                size={20}
                aria-hidden="true"
              />

              <div>
                <h2 className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Revisa tu correo
                </h2>

                <p className="mt-1 text-sm leading-6 text-emerald-800 dark:text-emerald-300">
                  Si existe una cuenta asociada
                  a ese correo, recibirás las
                  instrucciones para restablecer
                  la contraseña.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            El mensaje puede tardar unos minutos.
            Revisa también la carpeta de correo
            no deseado.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            <FiArrowLeft aria-hidden="true" />
            Volver al inicio de sesión
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <Input
            id="recovery-email"
            name="email"
            type="email"
            label="Correo electrónico"
            placeholder="nombre@utcj.edu.mx"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            leftIcon={
              <FiMail aria-hidden="true" />
            }
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
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
            disabled={!email}
            className="w-full"
          >
            Enviar enlace de recuperación
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
            >
              <FiArrowLeft aria-hidden="true" />
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}