import { useState } from "react";

interface UseDropdownValueParams<T extends string | number> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

export function useDropdownValue<T extends string | number>({
  value,
  defaultValue,
  onChange,
}: UseDropdownValueParams<T>) {
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const selectValue = (next: T) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const hasValue = currentValue !== undefined && currentValue !== "";

  return { currentValue, selectValue, hasValue };
}