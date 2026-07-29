import React from 'react';
import { FaBell, FaSearch } from "react-icons/fa";
import { MdOutlineMenu } from "react-icons/md";
import UserMenu from "@/components/ui/user-menu/UserMenu";
import  Logo  from "@/components/charts/logo"; // Ajusta la ruta o usa "@/charts/logo" según tus alias

interface TopBarProps {
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  return (
    <header className="w-full bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">

      {/* SECCIÓN IZQUIERDA: Logo + Botón Hamburguesa + Buscador */}
      <div className="flex items-center gap-4">

        {/* Espacio para el Logo */}
        <div className="flex items-center gap-2 pr-2 border-r border-slate-200/80">
          <Logo />
        </div>

        {/* Botón menú con interacción suave */}
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 active:scale-95 focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <MdOutlineMenu className="w-6 h-6" />
        </button>

        {/* Buscador Rápido tipo cápsula con fondo Slate */}
        <div className="relative hidden md:block">
          <FaSearch className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 bg-slate-100/70 text-slate-800 placeholder-slate-400 text-xs font-medium rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none transition-all duration-200 w-72"
          />
        </div>
      </div>

      {/* SECCIÓN DERECHA: Notificaciones y Perfil */}
      <div className="flex items-center gap-3">
        {/* Botón Notificaciones */}
        <button
          className="relative p-2.5 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 focus:outline-none"
          aria-label="Notificaciones"
        >
          <FaBell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Separador vertical fino */}
        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Menú de usuario (avatar + nombre + dropdown) */}
        <UserMenu
          name="Edwin Martinez"
          role="Admin"
          organization="UTCJ Sustentable"
          onNavigate={(path) => {
            // TODO: conectar con tu router, ej: navigate(path)
            console.log("Navegar a:", path);
          }}
          onSignOut={() => {
            // TODO: conectar con tu logica de logout
            console.log("Cerrar sesión");
          }}
        />
      </div>

    </header>
  );
};