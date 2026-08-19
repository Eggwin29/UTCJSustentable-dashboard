import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "@/context/auth/useAuth";

export default function AdminRoute() {
  const {
    profile,
    profileLoading,
  } = useAuth();

  if (profileLoading) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Verificando permisos...
        </p>
      </div>
    );
  }

  if (
    !profile ||
    !profile.active ||
    profile.role !== "admin"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}