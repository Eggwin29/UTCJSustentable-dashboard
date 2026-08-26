import {
  Component,
  useEffect,
} from "react";

import type {
  ErrorInfo,
  ReactNode,
} from "react";

import {
  FiAlertTriangle,
  FiHome,
  FiRefreshCw,
} from "react-icons/fi";

import {
  isRouteErrorResponse,
  useRouteError,
} from "react-router-dom";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(
    error: Error
  ): AppErrorBoundaryState {
    return {
      error,
    };
  }

  componentDidCatch(
    error: Error,
    errorInfo: ErrorInfo
  ) {
    console.error(
      "Error no controlado en la aplicación:",
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.error) {
      return (
        <ApplicationErrorView
          error={this.state.error}
        />
      );
    }

    return this.props.children;
  }
}

export function RouteErrorPage() {
  const routeError =
    useRouteError();

  const normalizedError =
    normalizeRouteError(
      routeError
    );

  useEffect(() => {
    console.error(
      "Error capturado por React Router:",
      routeError
    );
  }, [routeError]);

  return (
    <ApplicationErrorView
      error={normalizedError.error}
      status={normalizedError.status}
    />
  );
}

interface ApplicationErrorViewProps {
  error: Error;
  status?: number;
}

function ApplicationErrorView({
  error,
  status,
}: ApplicationErrorViewProps) {
  const isNotFound =
    status === 404;

  const title = isNotFound
    ? "No encontramos esta página"
    : "Algo no salió como esperábamos";

  const description = isNotFound
    ? "La dirección solicitada no existe o ya no se encuentra disponible."
    : "La aplicación encontró un problema inesperado. Puedes volver a intentarlo sin perder los datos que ya están guardados.";

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.assign("/");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 p-5 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:p-8">
      <div
        aria-hidden="true"
        className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-400/5"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-36 -left-28 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/5"
      />

      <section
        role="alert"
        aria-live="assertive"
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
      >
        <div className="h-1 bg-linear-to-r from-amber-400 via-orange-500 to-red-500" />

        <div className="p-6 sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <FiAlertTriangle
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
                {status
                  ? `Error ${status}`
                  : "Error de aplicación"}
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                {description}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleReload}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                >
                  <FiRefreshCw
                    aria-hidden="true"
                  />

                  Volver a intentar
                </button>

                <button
                  type="button"
                  onClick={handleGoHome}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
                >
                  <FiHome
                    aria-hidden="true"
                  />

                  Ir al Dashboard
                </button>
              </div>
            </div>
          </div>

          {import.meta.env.DEV && (
            <details className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-700 dark:bg-slate-950/60">
              <summary className="cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">
                Información para desarrollo
              </summary>

              <pre className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-red-600 dark:text-red-400">
                {error.message}
              </pre>
            </details>
          )}
        </div>

        <footer className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-400 sm:px-9">
          Si el problema continúa, recarga la página y comunícalo al administrador del sistema.
        </footer>
      </section>
    </main>
  );
}

function normalizeRouteError(
  routeError: unknown
): {
  error: Error;
  status?: number;
} {
  if (
    isRouteErrorResponse(
      routeError
    )
  ) {
    const message =
      typeof routeError.data ===
      "string"
        ? routeError.data
        : routeError.statusText ||
          `Error ${routeError.status}`;

    return {
      error: new Error(message),
      status: routeError.status,
    };
  }

  if (
    routeError instanceof Error
  ) {
    return {
      error: routeError,
    };
  }

  return {
    error: new Error(
      "Se produjo un error inesperado."
    ),
  };
}