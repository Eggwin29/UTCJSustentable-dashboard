// UserMenu.tsx
import React, { useRef, useState } from "react";
import { FiUser, FiBell, FiUsers, FiSettings, FiMoon, FiLogOut } from "react-icons/fi";
import { useClickOutside } from "./hooks/useClickOutside";
import UserMenuTrigger from "./UserMenuTrigger";
import UserMenuHeader from "./UserMenuHeader";
import UserMenuSection from "./UserMenuSection";
import UserMenuItem from "./UserMenuItem";
import UserMenuToggle from "./UserMenuToggle";

interface UserMenuProps {
  name: string;
  role: string;
  organization?: string;
  avatarUrl?: string;
  onNavigate?: (path: string) => void;
  onToggleDarkMode?: (enabled: boolean) => void;
  onSignOut?: () => void;
}

/**
 * Orquestador: maneja el estado de abierto/cerrado y de modo
 * oscuro, y compone el trigger + el panel a partir de las
 * piezas mas pequenas. No tiene estilos propios mas alla del
 * posicionamiento del panel.
 */
const UserMenu: React.FC<UserMenuProps> = ({
  name,
  role,
  organization,
  avatarUrl,
  onNavigate,
  onToggleDarkMode,
  onSignOut,
}) => {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  const handleToggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    onToggleDarkMode?.(checked);
  };

  const navigateAndClose = (path: string) => {
    onNavigate?.(path);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <UserMenuTrigger
        name={name}
        role={role}
        avatarUrl={avatarUrl}
        open={open}
        onClick={() => setOpen((prev) => !prev)}
      />

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-60 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50"
        >
          <UserMenuHeader
            name={name}
            role={role}
            organization={organization}
            avatarUrl={avatarUrl}
          />

          <UserMenuSection>
            <UserMenuItem
              icon={<FiUser size={16} />}
              label="Mi perfil"
              onClick={() => navigateAndClose("/perfil")}
            />
            <UserMenuItem
              icon={<FiBell size={16} />}
              label="Notificaciones"
              onClick={() => navigateAndClose("/notificaciones")}
            />
          </UserMenuSection>

          <UserMenuSection>
            <UserMenuItem
              icon={<FiUsers size={16} />}
              label="Usuarios"
              onClick={() => navigateAndClose("/usuarios")}
            />
            <UserMenuItem
              icon={<FiSettings size={16} />}
              label="Configuración"
              onClick={() => navigateAndClose("/configuracion")}
            />
          </UserMenuSection>

          <UserMenuSection>
            <UserMenuToggle
              icon={<FiMoon size={16} />}
              label="Modo oscuro"
              checked={darkMode}
              onChange={handleToggleDarkMode}
            />
          </UserMenuSection>

          <UserMenuSection>
            <UserMenuItem
              icon={<FiLogOut size={16} />}
              label="Cerrar sesión"
              variant="danger"
              onClick={() => {
                onSignOut?.();
                setOpen(false);
              }}
            />
          </UserMenuSection>
        </div>
      )}
    </div>
  );
};

export default UserMenu;