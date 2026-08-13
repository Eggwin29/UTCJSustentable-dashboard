// UserMenuHeader.tsx
import React from "react";
//import { getInitials } from "@/utils/getInitials";
import Avatar from "@/components/ui/avatar";

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
    <Avatar
      name={name}
      src={avatarUrl}
    />
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