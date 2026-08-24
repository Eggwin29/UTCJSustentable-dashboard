import React from "react";

import SidebarNavigation from "./SidebarNavigation";
import SidebarHeader from "./SidebarHeader";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar:
  React.FC<SidebarProps> = ({
    isOpen,
    onClose,
  }) => {
    return (
      <>
        {isOpen && (
          <div
            onClick={onClose}
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs transition-opacity lg:hidden"
            aria-hidden="true"
          />
        )}

        <aside
          className={`
            fixed left-0 top-0 z-40
            flex h-full shrink-0 flex-col
            justify-between border-r
            border-slate-800 bg-slate-900
            p-4 text-slate-300
            transition-all duration-300
            ease-in-out

            dark:border-slate-800
            dark:bg-[#0b1220]
            dark:shadow-[inset_-1px_0_0_rgba(148,163,184,0.05)]

            lg:relative
            lg:z-auto

            ${
              isOpen
                ? "w-64 translate-x-0 opacity-100"
                : "-translate-x-full lg:w-0 lg:translate-x-0 lg:overflow-hidden lg:p-0 lg:opacity-0"
            }
          `}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 hidden h-56 bg-linear-to-b from-slate-700/10 to-transparent dark:block"
          />

          <div className="relative z-10 w-56 flex-1 overflow-y-auto pr-1">
            <SidebarHeader
              onClose={onClose}
            />

            <SidebarNavigation
              onItemClick={() => {
                if (
                  window.innerWidth <
                  1024
                ) {
                  onClose();
                }
              }}
            />
          </div>

          <div className="relative z-10 mt-auto w-56 shrink-0 rounded-xl border border-slate-800 bg-slate-800/50 p-3 text-center dark:border-slate-700/60 dark:bg-slate-900/70">
            <p className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 dark:text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />

              Sistema activo
            </p>

            <p className="mt-0.5 text-[10px] text-slate-500">
              v1.0.0
            </p>
          </div>
        </aside>
      </>
    );
  };