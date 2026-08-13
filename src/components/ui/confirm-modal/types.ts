export type ConfirmVariant = "default" | "danger";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** "danger" usa el botón de confirmar en rojo, para operaciones destructivas (eliminar, etc). */
  variant?: ConfirmVariant;
}

export interface ConfirmRequest extends Required<Omit<ConfirmOptions, "description">> {
  description?: string;
  resolve: (value: boolean) => void;
}