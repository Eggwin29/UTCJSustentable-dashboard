import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/button";
import { FiAlertTriangle } from "react-icons/fi";
import type { ConfirmRequest } from "./types";

interface ConfirmModalProps {
  request: ConfirmRequest | null;
  onClose: (confirmed: boolean) => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ request, onClose }) => {
  const isOpen = Boolean(request);
  const cancelWrapperRef = useRef<HTMLDivElement>(null);
  // Foco inicial en "Cancelar" (acción segura por default) + cierre con Escape
  useEffect(() => {
    if (!isOpen) return;
    cancelWrapperRef.current?.querySelector("button")?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    // Bloquea el scroll del fondo mientras el modal está abierto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !request || typeof document === "undefined") return null;

  const isDanger = request.variant === "danger";

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose(false);
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby={request.description ? "confirm-modal-description" : undefined}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 shadow-xl p-6 animate-in zoom-in-95 slide-in-from-bottom-2 duration-150"
      >
        <div className="flex items-start gap-3">
          {isDanger && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <FiAlertTriangle className="h-4.5 w-4.5" />
            </span>
          )}
          <div className="min-w-0">
            <h2
              id="confirm-modal-title"
              className="text-base font-semibold text-slate-800 dark:text-white"
            >
              {request.title}
            </h2>
            {request.description && (
              <p
                id="confirm-modal-description"
                className="mt-1.5 text-sm text-slate-600 dark:text-slate-300"
              >
                {request.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <div ref={cancelWrapperRef}>
        <Button variant="secondary" onClick={() => onClose(false)}>
            {request.cancelText}
        </Button>
        </div>
          <Button variant={isDanger ? "danger" : "primary"} onClick={() => onClose(true)}>
            {request.confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;