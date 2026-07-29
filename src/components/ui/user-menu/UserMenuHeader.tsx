// UserMenuHeader.tsx
import React from "react";
import { getInitials } from "./utils/getInitials";

interface UserMenuHeaderProps {
  name: string;
  role: string;
  organization?: string;
  avatarUrl?: string;
}

/**
 * Bloque de identidad dentro del panel: avatar, nombre y
 * rol/organizacion. Es el "encabezado" del menu, separado
 * del resto de las opciones.
 */
const UserMenuHeader: React.FC<UserMenuHeaderProps> = ({
  name,
  role,
  organization,
  avatarUrl,
}) => (
  <div className="flex items-center gap-2.5 px-4 py-3">
    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-900 leading-tight">{name}</p>
      <p className="text-xs text-slate-500 leading-tight">
        {role}
        {organization ? ` · ${organization}` : ""}
      </p>
    </div>
  </div>
);

export default UserMenuHeader;