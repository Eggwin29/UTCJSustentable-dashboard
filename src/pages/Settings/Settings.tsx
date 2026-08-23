import {
  FiBookOpen,
  FiCalendar,
  FiPackage,
} from "react-icons/fi";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import AcademicProgramsSettings from "@/components/settings/AcademicProgramsSettings";
import AcademicTermsSettings from "@/components/settings/AcademicTermsSettings";
import MaterialsSettings from "@/components/settings/MaterialsSettings";

import { cn } from "@/utils/cn";

type SettingsTab =
  | "materials"
  | "academic-programs"
  | "academic-terms";

const tabs = [
  {
    id: "materials" as const,
    hash: "configuracion-materiales",
    label: "Materiales",
    icon: FiPackage,
  },
  {
    id: "academic-programs" as const,
    hash: "configuracion-carreras",
    label: "Carreras",
    icon: FiBookOpen,
  },
  {
    id: "academic-terms" as const,
    hash: "configuracion-cuatrimestres",
    label: "Cuatrimestres",
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
    tab: (typeof tabs)[number]
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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Configuración
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Administra los catálogos y periodos académicos de la aplicación.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Secciones de configuración"
        className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-900"
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
              tabIndex={
                selected ? 0 : -1
              }
              onClick={() =>
                selectTab(tab)
              }
              className={cn(
                "inline-flex min-w-max items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                selected
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              )}
            >
              <Icon aria-hidden="true" />

              {tab.label}
            </button>
          );
        })}
      </div>

      <section
        id={activeTabConfig.hash}
        role="tabpanel"
        aria-labelledby={`settings-tab-${activeTab}`}
        tabIndex={-1}
        className="scroll-mt-6 focus:outline-none"
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