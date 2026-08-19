import {
  useState,
  type ReactNode,
} from "react";

import {
  Navigate,
  Outlet,
} from "react-router-dom";

import Button from "@/components/ui/button";
import { useAuth } from "@/context/auth/useAuth";
import { authService } from "@/services/authService";

export default function ProtectedRoute() {
  const {
    user,
    profile,
    loading,
    profileLoading,
    profileError,
  } = useAuth();

  const [signingOut, setSigningOut] =
    useState(false);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await authService.signOut();
    } catch (error) {
      console.error(
        "No se pudo cerrar la sesión:",
        error
      );
    } finally {
      setSigningOut(false);
    }
  };

  if (
    loading ||
    (user && profileLoading)
  ) {
    return (
      <FullScreenMessage title="Cargando..." />
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    profileError ||
    !profile
  ) {
    return (
      <FullScreenMessage
        title="No se pudo verificar tu perfil"
        description="Cierra la sesión e inténtalo nuevamente."
        action={
          <Button
            variant="outline"
            loading={signingOut}
            onClick={() =>
              void handleSignOut()
            }
          >
            Cerrar sesión
          </Button>
        }
      />
    );
  }

  if (!profile.active) {
    return (
      <FullScreenMessage
        title="Cuenta desactivada"
        description="Tu cuenta no tiene acceso al sistema. Comunícate con un administrador."
        action={
          <Button
            variant="outline"
            loading={signingOut}
            onClick={() =>
              void handleSignOut()
            }
          >
            Cerrar sesión
          </Button>
        }
      />
    );
  }

  return <Outlet />;
}

interface FullScreenMessageProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

function FullScreenMessage({
  title,
  description,
  action,
}: FullScreenMessageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}

        {action && (
          <div className="mt-6">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}