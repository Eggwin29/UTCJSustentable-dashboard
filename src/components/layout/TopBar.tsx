import React from "react";
import { FaBell } from "react-icons/fa";
import { MdOutlineMenu } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import GlobalSearch from "@/components/layout/global-search/GlobalSearch";
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

  const {
    user,
    profile,
    profileLoading,
  } = useAuth();

  const { toast } = useToast();

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

  const canAccessAdmin =
    !profileLoading &&
    profile?.active === true &&
    profile.role === "admin";

  const handleSignOut = async () => {
    try {
      await authService.signOut();

      toast.success({
        title: "Sesión cerrada",
        description:
          "Has cerrado sesión correctamente.",
      });

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Error al cerrar sesión:",
        error
      );

      toast.error({
        title:
          "No se pudo cerrar sesión",
        description:
          "Ocurrió un problema al intentar cerrar tu sesión.",
      });
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-25 w-full items-center justify-between border-b border-slate-200/80 bg-white px-6 shadow-xs">
      <div className="flex items-center gap-4">
        <div>
          <Logo />
        </div>

        <Divider vertical />

        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl p-2.5 text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none active:scale-95"
          aria-label="Mostrar u ocultar menú lateral"
        >
          <MdOutlineMenu className="h-6 w-6" />
        </button>

        <GlobalSearch
          role={profile?.role ?? null}
          isRoleLoading={profileLoading}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
          aria-label="Notificaciones"
        >
          <FaBell className="h-4 w-4" />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        <Divider
          vertical
          className="mx-1"
        />

        <UserMenu
          name={displayName}
          role={displayRole}
          canAccessAdmin={canAccessAdmin}
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