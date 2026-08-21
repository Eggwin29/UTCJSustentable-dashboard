import { useState } from "react";

import {
  FiBriefcase,
  FiUsers,
} from "react-icons/fi";

import HumanCapitalSection from "@/pages/Participation/HumanCapitalSection";
import InternshipParticipationSection from "@/pages/Participation/InternshipParticipationSection";

import { cn } from "@/utils/cn";

type ParticipationTab =
  | "human-capital"
  | "internships";

const tabs = [
  {
    id: "human-capital" as const,
    label: "Capital humano",
    icon: FiUsers,
  },
  {
    id: "internships" as const,
    label: "Capital estadías",
    icon: FiBriefcase,
  },
];

export default function Participation() {
  const [activeTab, setActiveTab] =
    useState<ParticipationTab>(
      "human-capital"
    );

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
              aria-controls={`participation-panel-${tab.id}`}
              tabIndex={
                selected ? 0 : -1
              }
              onClick={() =>
                setActiveTab(tab.id)
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
        id={`participation-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`participation-tab-${activeTab}`}
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