import React from 'react';
import SidebarNavigation from "./SidebarNavigation";
import SidebarHeader from "./SidebarHeader";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* TELÓN OSCURO (Móviles) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* PANEL LATERAL DEL SIDEBAR */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 z-40 lg:z-auto
          h-full bg-slate-900 text-slate-300 
          flex flex-col justify-between p-4 
          border-r border-slate-800 
          transition-all duration-300 ease-in-out shrink-0
          ${
            isOpen 
              ? 'translate-x-0 w-64 opacity-100' 
              : '-translate-x-full lg:translate-x-0 lg:w-0 lg:p-0 lg:opacity-0 lg:overflow-hidden'
          }
        `}
      >
        {/* Scroll interno por si hay muchos ítems en el menú */}
        <div className="w-56 flex-1 overflow-y-auto pr-1">
          <SidebarHeader onClose={onClose} />

          <SidebarNavigation
            onItemClick={() => {
              if (window.innerWidth < 1024) {
                onClose();
              }
            }}
          />
        </div>

        {/* Footer del Sidebar */}
        <div className="w-56 p-3 bg-slate-800/50 rounded-xl border border-slate-800 text-center mt-auto shrink-0">
          <p className="text-[11px] font-medium text-slate-400">Sistema Activo</p>
          <p className="text-[10px] text-slate-500 mt-0.5">v1.0.0</p>
        </div>
      </aside>
    </>
  );
};