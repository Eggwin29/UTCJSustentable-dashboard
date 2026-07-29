// UserMenuSection.tsx
import React from "react";

interface UserMenuSectionProps {
  children: React.ReactNode;
}

/**
 * Agrupa un conjunto de UserMenuItem/UserMenuToggle con un
 * separador superior. Si en el futuro cambia el estilo del
 * separador (ej. degradado como en el sidebar), este es el
 * unico lugar que hay que tocar.
 */
const UserMenuSection: React.FC<UserMenuSectionProps> = ({ children }) => (
  <div className="border-t border-slate-200 py-1">{children}</div>
);

export default UserMenuSection;