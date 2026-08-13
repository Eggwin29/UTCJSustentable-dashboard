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
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
  >
    <span className="flex items-center gap-2.5">
      <span className="text-slate-500">{icon}</span>
      {label}
    </span>
    <span
      className={`w-8 h-4.5 rounded-full relative transition-colors ${
        checked ? "bg-emerald-600" : "bg-slate-200"
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