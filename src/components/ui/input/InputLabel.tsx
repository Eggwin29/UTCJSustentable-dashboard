import React from "react";
import { cn } from "@/utils/cn";

interface InputLabelProps {
  htmlFor: string;
  label: string;
  hasError: boolean;
  disabled?: boolean;
}

const InputLabel: React.FC<InputLabelProps> = ({ htmlFor, label, hasError, disabled }) => (
  <label
    htmlFor={htmlFor}
    className={cn(
      "block text-xs font-medium uppercase tracking-wide transition-colors",
      disabled
        ? "text-slate-300 dark:text-slate-600"
        : hasError
        ? "text-red-500"
        : "text-slate-500 dark:text-slate-400 peer-focus-within:text-emerald-600 dark:peer-focus-within:text-emerald-500"
    )}
  >
    {label}
  </label>
);

export default InputLabel;