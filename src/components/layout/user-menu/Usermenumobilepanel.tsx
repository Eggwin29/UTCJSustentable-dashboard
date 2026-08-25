// UserMenuMobilePanel.tsx

import React, {
  useEffect,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  FiX,
} from "react-icons/fi";

interface UserMenuMobilePanelProps {
  onClose: () => void;
  children: React.ReactNode;
}

const UserMenuMobilePanel:
  React.FC<
    UserMenuMobilePanelProps
  > = ({
    onClose,
    children,
  }) => {
    useEffect(() => {
      const originalOverflow =
        document.body.style
          .overflow;

      document.body.style.overflow =
        "hidden";

      const handleKeyDown = (
        event: KeyboardEvent
      ) => {
        if (
          event.key === "Escape"
        ) {
          onClose();
        }
      };

      window.addEventListener(
        "keydown",
        handleKeyDown
      );

      return () => {
        document.body.style.overflow =
          originalOverflow;

        window.removeEventListener(
          "keydown",
          handleKeyDown
        );
      };
    }, [onClose]);

    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-menu-mobile-title"
        className="fixed inset-0 z-[200] isolate flex flex-col bg-white text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 md:hidden"
      >
        <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p
              id="user-menu-mobile-title"
              className="text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              Cuenta
            </p>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Perfil y preferencias
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Cerrar menú"
            className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white overscroll-contain dark:bg-slate-950">
          {children}
        </div>
      </div>,
      document.body
    );
  };

export default UserMenuMobilePanel;