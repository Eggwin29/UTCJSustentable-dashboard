import React from 'react';
//import { NavLink } from 'react-router-dom';
import SidebarNavigation from "./SidebarNavigation";

import SidebarHeader from "./SidebarHeader";


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}


export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* TELÓN OSCURO (Backdrop solo en móviles/tablets) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* PANEL LATERAL DEL SIDEBAR */}
      <aside
      /* Posicionamiento en móvil: superpuesto (fixed) */
        className={`
          fixed lg:relative top-0 left-0 z-40 lg:z-auto
          h-screen lg:h-auto w-64 bg-slate-900 text-slate-300 
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
        <div className="w-56"> {/* Ancho fijo interno para evitar que los textos colapsen feo al animar */}
          
         {/* Llama al Header de SidebarHeader.tsx */}
          <SidebarHeader onClose={onClose} />

          <SidebarNavigation
          onItemClick={() => {
            if (window.innerWidth < 1024) {
              onClose();
            }
          }}
/>
        </div>

        <div className="w-56 p-3 bg-slate-800/50 rounded-xl border border-slate-800 text-center mt-auto">
          <p className="text-[11px] font-medium text-slate-400">Sistema Activo</p>
          <p className="text-[10px] text-slate-500 mt-0.5">v1.0.0</p>
        </div>
      </aside>
    </>
  );
};