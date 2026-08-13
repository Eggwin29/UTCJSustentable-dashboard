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
    className="absolute right-0 mt-3 w-60 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50"
  >
    {children}
  </div>
);

export default UserMenuDesktopPanel;