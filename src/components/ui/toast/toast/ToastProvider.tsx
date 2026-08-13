import React, { useCallback, useState } from "react";
import ToastContainer from "./ToastContainer";
import { ToastContext, type ToastContextValue } from "./ToastContext";
import type { ToastItem, ToastOptions, ToastVariant } from "./types";

// Todas las variantes se autocierran; success dura un poco más porque no requiere leer con urgencia.
const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 6000,
  error: 5000,
  warning: 5000,
  info: 5000,
};

let idCounter = 0;
const nextId = () => `toast-${Date.now()}-${idCounter++}`;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((options: ToastOptions) => {
    const variant = options.variant ?? "info";
    const id = nextId();
    const duration = options.duration ?? DEFAULT_DURATION[variant];

    setToasts((prev) => [
      ...prev,
      { id, variant, title: options.title, description: options.description, duration },
    ]);
    return id;
  }, []);

  const toast: ToastContextValue["toast"] = {
    success: (options) => show({ ...options, variant: "success" }),
    error: (options) => show({ ...options, variant: "error" }),
    warning: (options) => show({ ...options, variant: "warning" }),
    info: (options) => show({ ...options, variant: "info" }),
  };

  return (
    <ToastContext.Provider value={{ show, dismiss, toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};