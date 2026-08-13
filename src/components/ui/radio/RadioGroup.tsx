// components/ui/radio/RadioGroup.tsx
import React, { useId } from "react";
import { cn } from "@/utils/cn";

export interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  direction?: "row" | "col";
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  defaultValue,
  onChange,
  label,
  error,
  disabled,
  direction = "col",
}) => {
  const groupId = useId();

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>}

      <div className={cn("flex gap-4", direction === "col" && "flex-col gap-2.5")}>
        {options.map((opt) => {
          const optionId = `${groupId}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={optionId}
              className={cn("flex items-center gap-2.5 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed")}
            >
              <input
                type="radio"
                id={optionId}
                name={name}
                value={opt.value}
                disabled={disabled}
                defaultChecked={defaultValue === opt.value}
                checked={value !== undefined ? value === opt.value : undefined}
                onChange={() => onChange?.(opt.value)}
                className={cn(
                  "h-4.5 w-4.5 shrink-0 appearance-none rounded-full border-2 border-slate-300 dark:border-slate-600",
                  "checked:border-[5px] checked:border-emerald-600",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
                  error && "border-red-400"
                )}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{opt.label}</span>
            </label>
          );
        })}
      </div>

      {error && <p className="text-xs px-1 text-red-500">{error}</p>}
    </div>
  );
};

export default RadioGroup;