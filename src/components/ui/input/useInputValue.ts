import { useState } from "react";

interface UseInputValueParams {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useInputValue({ value, defaultValue, onChange }: UseInputValueParams) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const clear = () => {
    if (isControlled) {
      onChange?.({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
    } else {
      setInternalValue("");
    }
  };

  const hasValue = currentValue !== "";

  return { currentValue, handleChange, clear, hasValue, isControlled };
}