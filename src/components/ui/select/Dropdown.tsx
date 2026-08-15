// components/ui/dropdown/Dropdown.tsx
import React, { useId, useRef, useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { sizeConfig, getContainerClasses } from "../input/inputConfig";
import type { InputSize, InputVariant } from "../input/inputConfig";
import InputLabel from "../input/InputLabel";
import { useDropdownValue } from "@/hooks/useDropdownValue";

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Dropdown: React.FC<SelectProps> = ({
  options,
  label,
  helperText,
  error,
  size = "md",
  variant = "outline",
  leftIcon,
  value,
  defaultValue,
  onChange,
  placeholder = "Selecciona una opción",
  disabled,
  className,
  id,
}) => {
  const generatedId = useId();
  const dropdownId = id ?? generatedId;
  const hasError = Boolean(error);
  const config = sizeConfig[size];

  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { currentValue, selectValue, hasValue } = useDropdownValue({
    value,
    defaultValue,
    onChange,
  });

  const selectedOption = options.find((opt) => opt.value === currentValue);

  // Cierra al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openMenu = () => {
    if (disabled) return;
    setActiveIndex(options.findIndex((opt) => opt.value === currentValue));
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      openMenu();
      return;
    }

    if (!isOpen) return;

    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectValue(options[activeIndex].value);
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5" ref={rootRef}>
      {label && (
        <InputLabel htmlFor={dropdownId} label={label} hasError={hasError} disabled={disabled} />
      )}

      <div className="relative w-full">
        <button
          type="button"
          id={dropdownId}
          onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={hasError}
          aria-describedby={helperText || error ? `${dropdownId}-description` : undefined}
          className={cn(
            "peer relative w-full flex items-center text-left transition-colors duration-200",
            getContainerClasses(variant, hasError),
            config.height,
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer",
            className
          )}
        >
          {leftIcon && (
            <span className="pl-3 flex items-center text-slate-400 dark:text-slate-500">
              {leftIcon}
            </span>
          )}

          <span
          className={cn(
            "flex-1 truncate",
            config.text,
            config.inputPadding,
            leftIcon ? "pl-2" : undefined,
            "pr-2",
            hasValue ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

          <span
            className={cn(
              "pr-3 flex items-center text-slate-400 dark:text-slate-500 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <ul
            role="listbox"
            className="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {options.map((opt, index) => {
              const isSelected = opt.value === currentValue;
              const isActive = index === activeIndex;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    selectValue(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors",
                    isSelected
                      ? "bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-200",
                    isActive && !isSelected && "bg-slate-100 dark:bg-slate-700/60"
                  )}
                >
                  {opt.icon && <span className="text-slate-400 dark:text-slate-500">{opt.icon}</span>}
                  {opt.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {(helperText || error) && (
        <p
          id={`${dropdownId}-description`}
          className={cn(
            "text-xs px-1 transition-colors",
            hasError ? "text-red-500" : "text-slate-500 dark:text-slate-400"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Dropdown;