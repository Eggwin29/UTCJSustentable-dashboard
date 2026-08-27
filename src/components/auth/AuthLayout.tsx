import type {
  ReactNode,
} from "react";

import Logo from "@/components/charts/logo";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 dark:bg-slate-950 sm:px-6">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-700 via-emerald-500 to-teal-500"
      />

      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/15"
      />

      <main className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-32 w-36 items-center justify-center p-2">
        <Logo
          width="100%"
          height="100%"
        />
      </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 sm:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </header>

          {children}
        </section>

        <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
          Acceso exclusivo para personal autorizado.
        </p>
      </main>
    </div>
  );
}