import React, {
  useRef,
  useState,
} from "react";

import { useClickOutside } from "@/hooks/useClickOutside.ts";
import { useMediaQuery } from "@/hooks/useMediaQuery.ts";

import UserMenuTrigger from "./UserMenuTrigger.tsx";
import UserMenuContent from "./Usermenucontent.tsx";
import UserMenuDesktopPanel from "./Usermenudesktoppanel.tsx";
import UserMenuMobilePanel from "./Usermenumobilepanel.tsx";

interface UserMenuProps {
  name: string;
  role: string;
  canAccessAdmin: boolean;
  organization?: string;
  avatarUrl?: string;
  onNavigate?: (path: string) => void;
  onToggleDarkMode?: (
    enabled: boolean
  ) => void;
  onSignOut?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  name,
  role,
  canAccessAdmin,
  organization,
  avatarUrl,
  onNavigate,
  onToggleDarkMode,
  onSignOut,
}) => {
  const [open, setOpen] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  const isDesktop = useMediaQuery(
    "(min-width: 768px)"
  );

  useClickOutside(
    containerRef,
    () => setOpen(false),
    open && isDesktop
  );

  const handleToggleDarkMode = (
    checked: boolean
  ) => {
    setDarkMode(checked);
    onToggleDarkMode?.(checked);
  };

  const navigateAndClose = (
    path: string
  ) => {
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
      canAccessAdmin={
        canAccessAdmin
      }
      organization={organization}
      avatarUrl={avatarUrl}
      darkMode={darkMode}
      onToggleDarkMode={
        handleToggleDarkMode
      }
      onNavigate={navigateAndClose}
      onSignOut={handleSignOut}
    />
  );

  return (
    <div
      className="relative"
      ref={containerRef}
    >
      <UserMenuTrigger
        name={name}
        role={role}
        avatarUrl={avatarUrl}
        open={open}
        onClick={() =>
          setOpen((previous) => !previous)
        }
      />

      {open &&
        (isDesktop ? (
          <UserMenuDesktopPanel>
            {content}
          </UserMenuDesktopPanel>
        ) : (
          <UserMenuMobilePanel
            onClose={() =>
              setOpen(false)
            }
          >
            {content}
          </UserMenuMobilePanel>
        ))}
    </div>
  );
};

export default UserMenu;