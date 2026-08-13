// ClearButton.tsx
import React from "react";
import { FiX } from "react-icons/fi";

interface ClearButtonProps {
  onClick: () => void;
}

const ClearButton: React.FC<ClearButtonProps> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
    aria-label="Limpiar campo"
  >
    <FiX className="h-4 w-4" />
  </button>
);

export default ClearButton;