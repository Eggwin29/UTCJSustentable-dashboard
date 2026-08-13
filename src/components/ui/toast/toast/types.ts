export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** ms antes de auto-cerrarse. Si se omite, se usa el default de cada variante. 0 = nunca auto-cierra. */
  duration?: number;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}