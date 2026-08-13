// components/ui/textarea/useTextareaValue.ts
import { useState } from "react";

interface UseTextareaValueParams {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function useTextareaValue({ value, defaultValue, onChange }: UseTextareaValueParams) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const clear = () => {
    if (isControlled) {
      onChange?.({ target: { value: "" } } as React.ChangeEvent<HTMLTextAreaElement>);
    } else {
      setInternalValue("");
    }
  };

  const hasValue = currentValue !== "";

  return { currentValue, handleChange, clear, hasValue, isControlled };
}