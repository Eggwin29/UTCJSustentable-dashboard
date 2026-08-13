// components/ui/switch/Switch.tsx
import React, { useId } from "react";
import { cn } from "@/utils/cn";

interface SwitchProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

const Switch: React.FC<SwitchProps> = ({ label, checked, defaultChecked, onChange, disabled, id }) => {
  const generatedId = useId();
  const switchId = id ?? generatedId;

  return (
    <label
      htmlFor={switchId}
      className={cn("flex items-center gap-3 cursor-pointer select-none w-fit", disabled && "opacity-50 cursor-not-allowed")}
    >
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          id={switchId}
          disabled={disabled}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-slate-300 dark:bg-slate-600 transition-colors duration-200",
            "peer-checked:bg-emerald-600",
            "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-500"
          )}
        />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
      </span>
      {label && <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>}
    </label>
  );
};

export default Switch;