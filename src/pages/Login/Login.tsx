import {
  useState,
  type FormEvent,
} from "react";

import {
  FiCheckCircle,
  FiLock,
  FiMail,
} from "react-icons/fi";

import {
  Link,
  Navigate,
  useSearchParams,
} from "react-router-dom";

import AuthLayout from "@/components/auth/AuthLayout";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input/Input";
import Spinner from "@/components/ui/spinner/Spinner";

import {
  useAuth,
} from "@/context/auth/useAuth";

import {
  authService,
} from "@/services/authService";

export default function Login() {
  const {
    user,
    loading,
  } = useAuth();

  const [
    searchParams,
  ] = useSearchParams();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const passwordUpdated =
    searchParams.get(
      "passwordUpdated"
    ) === "1";

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await authService.signIn(
        email.trim().toLowerCase(),
        password
      );
    } catch (error) {
      console.error(
        "No se pudo iniciar sesión:",
        error
      );

      setErrorMessage(
        "El correo o la contraseña no son correctos."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      description="Ingresa tus credenciales para acceder al panel de seguimiento ambiental."
    >
      {passwordUpdated && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <FiCheckCircle
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />

          <span>
            Tu contraseña fue actualizada.
            Ya puedes iniciar sesión.
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <Input
          id="login-email"
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

        <div className="space-y-2">
          <Input
            id="login-password"
            name="password"
            type="password"
            label="Contraseña"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            leftIcon={
              <FiLock aria-hidden="true" />
            }
            autoComplete="current-password"
            showPasswordToggle
            required
            disabled={isSubmitting}
          />

          <div className="flex justify-end">
            <Link
              to="/recuperar-contrasena"
              className="text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

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
          disabled={!email || !password}
          className="w-full"
        >
          {isSubmitting
            ? "Iniciando sesión..."
            : "Iniciar sesión"}
        </Button>
      </form>
    </AuthLayout>
  );
}