// UserMenuItem.tsx
import React from "react";

interface UserMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "default" | "danger";
}

/**
 * Fila individual dentro del menu de usuario.
 * Es el equivalente a un SidebarItem, pero para el popover de cuenta.
 */
const UserMenuItem: React.FC<UserMenuItemProps> = ({
  icon,
  label,
  onClick,
  variant = "default",
}) => {
  const colorClasses =
    variant === "danger"
      ? "text-red-600 hover:bg-red-50"
      : "text-slate-700 hover:bg-slate-50";

  const iconColor = variant === "danger" ? "text-red-600" : "text-slate-500";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${colorClasses}`}
    >
      <span className={iconColor}>{icon}</span>
      {label}
    </button>
  );
};

export default UserMenuItem;