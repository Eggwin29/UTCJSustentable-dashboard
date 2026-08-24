// UserMenuDesktopPanel.tsx
import React from "react";

interface UserMenuDesktopPanelProps {
  children: React.ReactNode;
}

/**
 * "Chrome" del menu en escritorio: caja flotante anclada
 * debajo del avatar, con borde, sombra y ancho fijo.
 */
const UserMenuDesktopPanel: React.FC<UserMenuDesktopPanelProps> = ({
  children,
}) => (
  <div
  role="menu"
  className="absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
  >
    {children}
  </div>
);

export default UserMenuDesktopPanel;