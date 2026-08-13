// components/ui/select/useSelectValue.ts
import { useState } from "react";

interface UseSelectValueParams {
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
}

export function useSelectValue({ value, defaultValue, onChange }: UseSelectValueParams) {
  const [internalValue, setInternalValue] = useState<string | number>(defaultValue ?? "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (!isControlled) setInternalValue(newValue);
    onChange?.(newValue);
  };

  const hasValue = currentValue !== "";

  return { currentValue, handleChange, hasValue };
}