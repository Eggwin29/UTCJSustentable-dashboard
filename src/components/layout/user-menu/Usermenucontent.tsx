import React from "react";

import {
  FiLogOut,
  FiMoon,
  FiSettings,
  FiUsers,
  FiUser
} from "react-icons/fi";

import UserMenuHeader from "./UserMenuHeader";
import UserMenuItem from "./UserMenuItem";
import UserMenuSection from "./UserMenuSection";
import UserMenuToggle from "./UserMenuToggle";


interface UserMenuContentProps {
  name: string;
  role: string;
  canAccessAdmin: boolean;
  organization?: string;
  avatarUrl?: string;
  darkMode: boolean;

  onToggleDarkMode: (
    checked: boolean
  ) => void;

  onNavigate: (
    path: string
  ) => void;

  onSignOut: () => void;
}

const UserMenuContent: React.FC<
  UserMenuContentProps
> = ({
  name,
  role,
  canAccessAdmin,
  organization,
  avatarUrl,
  darkMode,
  onToggleDarkMode,
  onNavigate,
  onSignOut,
}) => (
  <>
    <UserMenuHeader
      name={name}
      role={role}
      organization={organization}
      avatarUrl={avatarUrl}
    />
    <UserMenuSection>
          <UserMenuItem
            icon={
              <FiUser size={16} />
            }
            label="Mi perfil"
            onClick={() =>
              onNavigate("/perfil")
            }
          />
        </UserMenuSection>
        

    {canAccessAdmin && (
      
      <UserMenuSection>
        <UserMenuItem
          icon={
            <FiUsers size={16} />
          }
          label="Usuarios"
          onClick={() =>
            onNavigate("/users")
          }
        />

        <UserMenuItem
          icon={
            <FiSettings
              size={16}
            />
          }
          label="Configuración"
          onClick={() =>
            onNavigate("/settings")
          }
        />
      </UserMenuSection>
    )}

    <UserMenuSection>
      <UserMenuToggle
        icon={
          <FiMoon size={16} />
        }
        label="Modo oscuro"
        checked={darkMode}
        onChange={
          onToggleDarkMode
        }
      />
    </UserMenuSection>

    <UserMenuSection>
      <UserMenuItem
        icon={
          <FiLogOut size={16} />
        }
        label="Cerrar sesión"
        variant="danger"
        onClick={onSignOut}
      />
    </UserMenuSection>
  </>
);

export default UserMenuContent;