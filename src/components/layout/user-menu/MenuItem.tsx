// UserMenu.tsx
import React, { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside.ts";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";
import UserMenuTrigger from "./UserMenuTrigger.tsx";
import UserMenuContent from "./Usermenucontent.tsx";
import UserMenuDesktopPanel from "./Usermenudesktoppanel.tsx";
import UserMenuMobilePanel from "./Usermenumobilepanel.tsx";

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
 * oscuro, decide si el panel se muestra como dropdown (desktop)
 * o pantalla completa (movil/tablet), y compone el trigger +
 * el panel correspondiente. El breakpoint (768px) coincide con
 * el "md" que ya usas en el resto del proyecto (ej. el buscador
 * del TopBar usa "hidden md:block").
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
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // En movil no hay "afuera" que cerrar (pantalla completa),
  // asi que solo activamos el cierre por clic externo en desktop.
  useClickOutside(containerRef, () => setOpen(false), open && isDesktop);

  const handleToggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    onToggleDarkMode?.(checked);
  };

  const navigateAndClose = (path: string) => {
    onNavigate?.(path);
    setOpen(false);
  };

  const handleSignOut = () => {
    onSignOut?.();
    setOpen(false);
  };

  const content = (
    <UserMenuContent
      name={name}
      role={role}
      organization={organization}
      avatarUrl={avatarUrl}
      darkMode={darkMode}
      onToggleDarkMode={handleToggleDarkMode}
      onNavigate={navigateAndClose}
      onSignOut={handleSignOut}
    />
  );

  return (
    <div className="relative" ref={containerRef}>
      <UserMenuTrigger
        name={name}
        role={role}
        avatarUrl={avatarUrl}
        open={open}
        onClick={() => setOpen((prev) => !prev)}
      />

      {open &&
        (isDesktop ? (
          <UserMenuDesktopPanel>{content}</UserMenuDesktopPanel>
        ) : (
          <UserMenuMobilePanel onClose={() => setOpen(false)}>
            {content}
          </UserMenuMobilePanel>
        ))}
    </div>
  );
};

export default UserMenu;