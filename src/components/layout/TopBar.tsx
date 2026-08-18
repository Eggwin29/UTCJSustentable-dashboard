import React from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { MdOutlineMenu } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import UserMenu from "@/components/layout/user-menu/MenuItem";
import Logo from "@/components/charts/logo";
import Divider from "@/components/ui/divider";

import { useAuth } from "@/context/auth/useAuth";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/toast/toast";

interface TopBarProps {
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
}) => {
  const navigate = useNavigate();

  const { user, profile, profileLoading } = useAuth();
  const { toast } = useToast();

  // =====================================================
  // DATOS DEL USUARIO
  // =====================================================

  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : "";

  const displayName =
    fullName ||
    user?.email ||
    "Usuario";

  const displayRole = profileLoading
    ? "Cargando..."
    : profile?.role === "admin"
      ? "Administrador"
      : "Usuario";

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const handleSignOut = async () => {
    try {
      await authService.signOut();

      toast.success({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);

      toast.error({
        title: "No se pudo cerrar sesión",
        description:
          "Ocurrió un problema al intentar cerrar tu sesión.",
      });
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200/80 px-6 h-25 flex items-center justify-between sticky top-0 z-20 shadow-xs">

      {/* SECCIÓN IZQUIERDA */}
      <div className="flex items-center gap-4">

        <div>
          <Logo />
        </div>

        <Divider vertical={true} />

        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 active:scale-95 focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <MdOutlineMenu className="w-6 h-6" />
        </button>

        <div className="relative hidden md:block">
          <FaSearch className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 bg-slate-100/70 text-slate-800 placeholder-slate-400 text-xs font-medium rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none transition-all duration-200 w-72"
          />
        </div>
      </div>

      {/* SECCIÓN DERECHA */}
      <div className="flex items-center gap-3">

        <button
          className="relative p-2.5 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 focus:outline-none"
          aria-label="Notificaciones"
        >
          <FaBell className="w-4 h-4" />

          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
        </button>

        <Divider
          vertical={true}
          className="mx-1"
        />

        <UserMenu
          name={displayName}
          role={displayRole}
          organization="UTCJ Sustentable"

          onNavigate={(path) => {
            navigate(path);
          }}

          onSignOut={handleSignOut}
        />

      </div>
    </header>
  );
};