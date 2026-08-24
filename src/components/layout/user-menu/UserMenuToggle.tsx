// UserMenuToggle.tsx
import React from "react";

interface UserMenuToggleProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Fila con un switch, para opciones on/off dentro del menu
 * (ej. modo oscuro). Vive separada de UserMenuItem porque su
 * estructura y props son distintas (checked/onChange vs onClick).
 */
const UserMenuToggle: React.FC<UserMenuToggleProps> = ({
  icon,
  label,
  checked,
  onChange,
}) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() =>
        onChange(!checked)
      }
      className="flex w-full items-center justify-between px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
    >
    <span className="flex items-center gap-2.5">
      <span className="text-slate-500">{icon}</span>
      {label}
    </span>
    <span
      className={`relative h-4.5 w-8 rounded-full transition-colors ${
        checked
          ? "bg-emerald-600"
          : "bg-slate-200 dark:bg-slate-700"
      }`}
    >
      <span
        className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
          checked ? "left-4" : "left-0.5"
        }`}
      />
    </span>
  </button>
);

export default UserMenuToggle;