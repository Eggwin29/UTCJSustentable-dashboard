import type {
  IconType,
} from "react-icons";

import {
  FiBookOpen,
  FiCalendar,
  FiPackage,
  FiSettings,
} from "react-icons/fi";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import AcademicProgramsSettings from "@/components/settings/AcademicProgramsSettings";
import AcademicTermsSettings from "@/components/settings/AcademicTermsSettings";
import MaterialsSettings from "@/components/settings/MaterialsSettings";

import Badge from "@/components/ui/Badge/Badge";

import { cn } from "@/utils/cn";

type SettingsTab =
  | "materials"
  | "academic-programs"
  | "academic-terms";

interface SettingsTabConfig {
  id: SettingsTab;
  hash: string;
  label: string;
  description: string;
  icon: IconType;
}

const tabs: SettingsTabConfig[] = [
  {
    id: "materials",
    hash: "configuracion-materiales",
    label: "Materiales",
    description:
      "Catálogo y factores de CO₂.",
    icon: FiPackage,
  },
  {
    id: "academic-programs",
    hash: "configuracion-carreras",
    label: "Carreras",
    description:
      "Programas para Capital estadías.",
    icon: FiBookOpen,
  },
  {
    id: "academic-terms",
    hash: "configuracion-cuatrimestres",
    label: "Cuatrimestres",
    description:
      "Periodos y cuatrimestre actual.",
    icon: FiCalendar,
  },
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = getSettingsTab(
    location.hash
  );

  const activeTabConfig =
    tabs.find(
      (tab) => tab.id === activeTab
    ) ?? tabs[0];

  const selectTab = (
    tab: SettingsTabConfig
  ) => {
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: `#${tab.hash}`,
      },
      {
        replace: true,
      }
    );
  };

  return (
    <div className="space-y-7">
      <section
        className="
          relative overflow-hidden
          rounded-2xl border
          border-slate-200
          bg-linear-to-r
          from-white via-white
          to-amber-50/70
          p-6 shadow-sm
          dark:border-slate-700
          dark:from-slate-900
          dark:via-slate-900
          dark:to-amber-950/20
          sm:p-7
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute -right-14 -top-20
            h-48 w-48 rounded-full
            border-28
            border-amber-500/5
          "
        />

        <div className="relative flex items-start gap-4">
          <div
            className="
              flex h-13 w-13 shrink-0
              items-center justify-center
              rounded-2xl
              bg-amber-100
              text-2xl text-amber-700
              dark:bg-amber-900/40
              dark:text-amber-300
            "
          >
            <FiSettings
              aria-hidden="true"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="
                  text-2xl font-bold
                  text-slate-900
                  dark:text-white
                  sm:text-3xl
                "
              >
                Configuración
              </h1>

              <Badge variant="warning">
                3 catálogos
              </Badge>
            </div>

            <p
              className="
                mt-2 max-w-2xl
                text-sm leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              Administra los materiales,
              programas académicos y periodos
              que utiliza UTCJ Sustentable en
              sus registros y reportes.
            </p>
          </div>
        </div>
      </section>

      <div
        role="tablist"
        aria-label="Secciones de configuración"
        className="
          grid gap-3 rounded-2xl
          border border-slate-200
          bg-white p-2 shadow-sm
          dark:border-slate-700
          dark:bg-slate-900
          md:grid-cols-3
        "
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const selected =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`settings-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={tab.hash}
              tabIndex={selected ? 0 : -1}
              onClick={() =>
                selectTab(tab)
              }
              className={cn(
                "group flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all",
                selected
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-colors",
                  selected
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 dark:group-hover:text-emerald-400"
                )}
              >
                <Icon aria-hidden="true" />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {tab.label}
                </span>

                <span
                  className={cn(
                    "mt-0.5 block truncate text-xs",
                    selected
                      ? "text-emerald-50"
                      : "text-slate-500 dark:text-slate-400"
                  )}
                >
                  {tab.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <section
        id={activeTabConfig.hash}
        role="tabpanel"
        aria-labelledby={`settings-tab-${activeTab}`}
        tabIndex={-1}
        className="
          scroll-mt-28
          focus:outline-none
        "
      >
        {activeTab ===
          "materials" && (
          <MaterialsSettings />
        )}

        {activeTab ===
          "academic-programs" && (
          <AcademicProgramsSettings />
        )}

        {activeTab ===
          "academic-terms" && (
          <AcademicTermsSettings />
        )}
      </section>
    </div>
  );
}

function getSettingsTab(
  hash: string
): SettingsTab {
  const normalizedHash =
    hash.replace(/^#/, "");

  if (
    normalizedHash ===
    "configuracion-carreras"
  ) {
    return "academic-programs";
  }

  if (
    normalizedHash ===
    "configuracion-cuatrimestres"
  ) {
    return "academic-terms";
  }

  return "materials";
}