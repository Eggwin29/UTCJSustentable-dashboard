

import {
  FiArrowLeft,
  FiHome,
  FiMapPin,

} from "react-icons/fi";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import Button from "@/components/ui/button";





export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/", {
      replace: true,
    });
  };

  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-4 sm:py-8">
      <div className="w-full max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-2xl dark:bg-emerald-500/10"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/10"
          />

          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 via-sky-500 to-violet-500"
          />

          <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:p-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                <FiMapPin
                  aria-hidden="true"
                />

                Ruta no encontrada
              </div>

              <p className="mt-6 bg-linear-to-r from-emerald-600 via-sky-600 to-violet-600 bg-clip-text text-7xl font-black leading-none tracking-tight text-transparent sm:text-8xl">
                404
              </p>

              <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Esta página no está disponible
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                Es posible que la dirección sea
                incorrecta, que la página haya
                cambiado de ubicación o que ya
                no forme parte del sistema.
              </p>

              <div className="mt-5 max-w-xl rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Dirección solicitada
                </p>

                <code className="mt-1 block truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                  {location.pathname}
                </code>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  leftIcon={
                    <FiHome
                      aria-hidden="true"
                    />
                  }
                  onClick={() =>
                    navigate("/")
                  }
                >
                  Ir al Dashboard
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  leftIcon={
                    <FiArrowLeft
                      aria-hidden="true"
                    />
                  }
                  onClick={handleGoBack}
                >
                  Volver atrás
                </Button>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="relative mx-auto hidden h-72 w-72 items-center justify-center lg:flex"
            >
              <div className="absolute inset-0 rounded-full border border-dashed border-slate-300 dark:border-slate-700" />

              <div className="absolute inset-7 rounded-full border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/50" />

              <div className="absolute inset-14 rounded-full bg-emerald-100/80 shadow-inner dark:bg-emerald-950/50" />

              <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-emerald-600 text-5xl text-white shadow-xl shadow-emerald-600/20">
                <FiMapPin />
              </div>

              <span className="absolute right-3 top-10 h-4 w-4 rounded-full bg-sky-500 shadow-lg shadow-sky-500/40" />

              <span className="absolute bottom-9 left-5 h-3 w-3 rounded-full bg-violet-500 shadow-lg shadow-violet-500/40" />
            </div>
          </div>


        </div>

        <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
          Si llegaste aquí desde una opción del
          sistema, verifica que la dirección
          esté configurada correctamente.
        </p>
      </div>
    </section>
  );
}