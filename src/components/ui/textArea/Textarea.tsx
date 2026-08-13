// components/ui/textarea/Textarea.tsx
import React, { useId } from "react";
import { cn } from "@/utils/cn";
import { getContainerClasses } from "@/components/ui/input/inputConfig";
import type { InputVariant } from "@/components/ui/input/inputConfig";
import InputLabel from "@/components/ui/input/InputLabel";

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: InputVariant;
  rows?: number;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  helperText,
  error,
  variant = "outline",
  rows = 4,
  className,
  id,
  disabled,
  ...props
}) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hasError = Boolean(error);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <InputLabel htmlFor={textareaId} label={label} hasError={hasError} disabled={disabled} />}

      <div className={cn("relative w-full", getContainerClasses(variant, hasError), disabled && "opacity-50 cursor-not-allowed")}>
        <textarea
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={cn(
            "w-full bg-transparent outline-none resize-y p-3 text-sm",
            "text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={helperText || error ? `${textareaId}-description` : undefined}
          {...props}
        />
      </div>

      {(helperText || error) && (
        <p
          id={`${textareaId}-description`}
          className={cn("text-xs px-1 transition-colors", hasError ? "text-red-500" : "text-slate-500 dark:text-slate-400")}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Textarea;