// PasswordToggleButton.tsx
import React from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface PasswordToggleButtonProps {
  visible: boolean;
  onToggle: () => void;
}

const PasswordToggleButton: React.FC<PasswordToggleButtonProps> = ({ visible, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
    aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
  >
    {visible ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
  </button>
);

export default PasswordToggleButton;