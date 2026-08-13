// UserMenuMobilePanel.tsx
import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";

interface UserMenuMobilePanelProps {
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * "Chrome" del menu en movil/tablet: pantalla completa con su
 * propio boton de cierre (no hay "afuera" para hacer click).
 * Bloquea el scroll del body mientras esta abierto para que no
 * se sienta el contenido de atras moviendose.
 */
const UserMenuMobilePanel: React.FC<UserMenuMobilePanelProps> = ({
  onClose,
  children,
}) => {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div role="menu" className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
        <p className="text-sm font-semibold text-slate-900">Cuenta</p>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Cerrar menú"
        >
          <FiX size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};

export default UserMenuMobilePanel;