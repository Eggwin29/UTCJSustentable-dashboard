// components/ui/checkbox/Checkbox.tsx
import React, { useId } from "react";
import { cn } from "@/utils/cn";
import { FiCheck } from "react-icons/fi";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  error?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, error, className, id, disabled, ...props }) => {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={checkboxId}
        className={cn("flex items-center gap-2.5 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed")}
      >
        <span className="relative flex items-center justify-center">
          <input
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            className={cn(
              "peer h-4.5 w-4.5 shrink-0 appearance-none rounded border-2 border-slate-300 dark:border-slate-600",
              "checked:bg-emerald-600 checked:border-emerald-600",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
              error && "border-red-400",
              className
            )}
            {...props}
          />
          <FiCheck className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
        </span>
        {label && <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>}
      </label>
      {error && <p className="text-xs px-1 text-red-500">{error}</p>}
    </div>
  );
};

export default Checkbox;