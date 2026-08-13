import React from "react";
import { createPortal } from "react-dom";
import Toast from "./Toast";
import type { ToastItem } from "./types";

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-100 flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;