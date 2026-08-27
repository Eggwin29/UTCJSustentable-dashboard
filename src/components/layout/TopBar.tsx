import React from "react";

import {
  MdOutlineMenu,
} from "react-icons/md";

import {
  useNavigate,
} from "react-router-dom";

import Logo from "@/components/charts/logo";

import GlobalSearch from "@/components/layout/global-search/GlobalSearch";
import NotificationsMenu from "@/components/layout/notifications/NotificationsMenu";
import UserMenu from "@/components/layout/user-menu/MenuItem";

import {
  useToast,
} from "@/components/ui/toast/toast";

import {
  useAuth,
} from "@/context/auth/useAuth";

import {
  authService,
} from "@/services/authService";

interface TopBarProps {
  onToggleSidebar: () => void;
}

export const TopBar:
  React.FC<TopBarProps> = ({
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
      <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b border-slate-200/80 bg-white px-2 shadow-xs transition-colors duration-200 dark:border-emerald-950/60 dark:bg-slate-950 sm:h-22 sm:px-4 lg:h-25 lg:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-3 lg:gap-4">
          <div className="flex h-14 w-16 shrink-0 items-center justify-center sm:h-18 sm:w-20 lg:h-[82px] lg:w-[88px]">
            <Logo
              width="100%"
              height="100%"
            />
          </div>

          <div className="hidden sm:block">
            <TopBarDivider />
          </div>

          <button
            type="button"
            onClick={onToggleSidebar}
            className="shrink-0 rounded-xl p-2 text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none active:scale-95 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 sm:p-2.5"
            aria-label="Mostrar u ocultar menú lateral"
          >
            <MdOutlineMenu className="h-6 w-6" />
          </button>

          <GlobalSearch
            role={
              profile?.role ?? null
            }
            isRoleLoading={
              profileLoading
            }
          />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <NotificationsMenu
            key={
              user?.id ??
              "anonymous-notifications"
            }
          />

          <div className="hidden sm:block">
            <TopBarDivider />
          </div>

          <UserMenu
            name={displayName}
            role={displayRole}
            canAccessAdmin={
              canAccessAdmin
            }
            organization="UTCJ Sustentable"
            onNavigate={(path) => {
              navigate(path);
            }}
            onSignOut={
              handleSignOut
            }
          />
        </div>
      </header>
    );
  };

function TopBarDivider() {
  return (
    <span
      aria-hidden="true"
      className="mx-1 block h-9 w-px shrink-0 bg-linear-to-b from-transparent via-slate-300/80 to-transparent dark:via-slate-700/70"
    />
  );
}