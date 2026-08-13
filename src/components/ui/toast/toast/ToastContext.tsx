import { createContext } from "react";
import type { ToastOptions } from "./types";

export interface ToastContextValue {
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  toast: {
    success: (options: Omit<ToastOptions, "variant">) => string;
    error: (options: Omit<ToastOptions, "variant">) => string;
    warning: (options: Omit<ToastOptions, "variant">) => string;
    info: (options: Omit<ToastOptions, "variant">) => string;
  };
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);