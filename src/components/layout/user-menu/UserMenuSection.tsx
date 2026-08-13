// UserMenuSection.tsx
import React from "react";
import Divider from "@/components/ui/divider";

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
  <>
    <Divider spacing="none" />

    <div className="py-1">
        {children}
    </div>
  </>
);

export default UserMenuSection;