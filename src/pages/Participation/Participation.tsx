import {
  FiBriefcase,
  FiUsers,
} from "react-icons/fi";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import HumanCapitalSection from "@/pages/Participation/HumanCapitalSection";
import InternshipParticipationSection from "@/pages/Participation/InternshipParticipationSection";

import { cn } from "@/utils/cn";

type ParticipationTab =
  | "human-capital"
  | "internships";

const tabs = [
  {
    id: "human-capital" as const,
    hash: "capital-humano",
    label: "Capital humano",
    icon: FiUsers,
  },
  {
    id: "internships" as const,
    hash: "capital-estadias",
    label: "Capital estadías",
    icon: FiBriefcase,
  },
];

export default function Participation() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = getParticipationTab(
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
          Participación
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Seguimiento de la participación
          de la comunidad universitaria
          en UTCJ Sustentable.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Secciones de participación"
        className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-900"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const selected =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`participation-tab-${tab.id}`}
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
        aria-labelledby={`participation-tab-${activeTab}`}
        tabIndex={-1}
        className="scroll-mt-6 focus:outline-none"
      >
        {activeTab ===
        "human-capital" ? (
          <HumanCapitalSection />
        ) : (
          <InternshipParticipationSection />
        )}
      </section>
    </div>
  );
}

function getParticipationTab(
  hash: string
): ParticipationTab {
  const normalizedHash =
    hash.replace(/^#/, "");

  return normalizedHash ===
    "capital-estadias"
    ? "internships"
    : "human-capital";
}