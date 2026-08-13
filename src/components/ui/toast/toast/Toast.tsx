import React, { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from "react-icons/fi";
import type { ToastItem, ToastVariant } from "./types";

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const variantConfig: Record<
  ToastVariant,
  { border: string; bg: string; iconBg: string; icon: React.ReactNode }
> = {
  success: {
    border: "border-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconBg: "bg-emerald-600",
    icon: <FiCheck className="h-3.5 w-3.5" />,
  },
  error: {
    border: "border-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    iconBg: "bg-red-600",
    icon: <FiX className="h-3.5 w-3.5" />,
  },
  warning: {
    border: "border-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    iconBg: "bg-amber-500",
    icon: <FiAlertTriangle className="h-3.5 w-3.5" />,
  },
  info: {
    border: "border-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    iconBg: "bg-blue-600",
    icon: <FiInfo className="h-3.5 w-3.5" />,
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = variantConfig[toast.variant];

  // Monta con fade/slide-in
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(toast.id), 200); // espera a que termine la animación de salida
  };

  // Auto-dismiss (solo si duration > 0)
  useEffect(() => {
    if (!toast.duration) return;
    const timer = setTimeout(handleDismiss, toast.duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.duration]);

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
      className={cn(
        "w-full max-w-sm rounded-lg border-l-4 shadow-lg shadow-slate-900/10 transition-all duration-200",
        config.border,
        config.bg,
        isVisible && !isLeaving ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white mt-0.5",
            config.iconBg
          )}
        >
          {config.icon}
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 dark:text-white">{toast.title}</p>
          {toast.description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{toast.description}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar notificación"
          className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mt-0.5"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;