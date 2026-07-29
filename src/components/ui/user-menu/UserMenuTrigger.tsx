// UserMenuTrigger.tsx
import React from "react";
import { getInitials } from "./utils/getInitials";

interface UserMenuTriggerProps {
  name: string;
  role: string;
  avatarUrl?: string;
  open: boolean;
  onClick: () => void;
}

/**
 * Boton visible en el TopBar (avatar + nombre). No maneja
 * el estado de abierto/cerrado, solo lo reporta hacia arriba
 * via onClick — el estado real vive en UserMenu.tsx.
 */
const UserMenuTrigger: React.FC<UserMenuTriggerProps> = ({
  name,
  role,
  avatarUrl,
  open,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-3 focus:outline-none"
    aria-haspopup="menu"
    aria-expanded={open}
  >
    <div className="text-right hidden sm:block">
      <p className="text-sm font-medium text-slate-900 leading-tight">{name}</p>
      <p className="text-xs text-emerald-600 leading-tight">{role}</p>
    </div>
    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  </button>
);

export default UserMenuTrigger;