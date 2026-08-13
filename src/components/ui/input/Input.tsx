import React, { useId, useRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { sizeConfig, getContainerClasses } from "./inputConfig";
import type { InputSize, InputVariant } from "./inputConfig";
import { useInputValue } from "./useInputValue";
import ClearButton from "./ClearButton";
import PasswordToggleButton from "./PasswordToggleButton";
import InputLabel from "./InputLabel";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue"> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  showPasswordToggle?: boolean;
  value?: string;
  defaultValue?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  size = "md",
  variant = "outline",
  leftIcon,
  rightIcon,
  clearable = false,
  showPasswordToggle = false,
  className,
  id,
  type = "text",
  value,
  defaultValue,
  onChange,
  disabled,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { currentValue, handleChange, clear, hasValue } = useInputValue({
    value,
    defaultValue,
    onChange,
  });

  const hasError = Boolean(error);
  const config = sizeConfig[size];
  const resolvedType =
    showPasswordToggle && type === "password" ? (showPassword ? "text" : "password") : type;

  const showClearButton = clearable && hasValue && !disabled;
  const showPasswordButton = showPasswordToggle && type === "password";

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <InputLabel htmlFor={inputId} label={label} hasError={hasError} disabled={disabled} />
      )}

      <div
        className={cn(
          "peer relative w-full flex items-center transition-colors duration-200",
          getContainerClasses(variant, hasError),
          config.height,
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {leftIcon && (
          <span className="pl-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type={resolvedType}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "w-full h-full bg-transparent outline-none",
            "text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500",
            config.text,
            config.inputPadding,
            Boolean(leftIcon) && "pl-2",
            Boolean(showClearButton || showPasswordButton || rightIcon) && "pr-2",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={helperText || error ? `${inputId}-description` : undefined}
          {...props}
        />

        {rightIcon && !showClearButton && !showPasswordButton && (
          <span className="pr-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
            {rightIcon}
          </span>
        )}

        {showClearButton && (
          <span className="pr-3 flex items-center">
            <ClearButton onClick={clear} />
          </span>
        )}
        {showPasswordButton && (
          <span className="pr-3 flex items-center">
            <PasswordToggleButton
              visible={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
            />
          </span>
        )}
      </div>

      {(helperText || error) && (
        <p
          id={`${inputId}-description`}
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

export default Input;