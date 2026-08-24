// UserMenuTrigger.tsx
import React from "react";
//import { getInitials } from "@/utils/getInitials";
import Avatar from "@/components/ui/avatar";

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
      <p className="text-sm font-medium leading-tight text-slate-900 dark:text-slate-100">
        {name}
      </p>

      <p className="text-xs leading-tight text-emerald-600 dark:text-emerald-400">
        {role}
      </p>
    </div>
    <Avatar
      name={name}
      src={avatarUrl}
      size="md"
    />
  </button>
);

export default UserMenuTrigger;