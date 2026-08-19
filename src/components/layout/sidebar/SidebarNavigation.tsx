import Divider from "@/components/ui/divider";
import { useAuth } from "@/context/auth/useAuth";
import { navigation } from "@/constants/navigation";

import SidebarItem from "./SidebarItem";
import SidebarSubHeader from "./SidebarSubHeader";

interface SidebarNavigationProps {
  onItemClick?: () => void;
}

export default function SidebarNavigation({
  onItemClick,
}: SidebarNavigationProps) {
  const { profile } = useAuth();

  const mainItems = navigation.filter(
    (item) => item.type === "main"
  );

  const adminItems = navigation.filter(
    (item) => item.type === "admin"
  );

  const isAdmin =
    profile?.active === true &&
    profile.role === "admin";

  return (
    <>
      <SidebarSubHeader title="Principal" />

      <nav className="space-y-1.5">
        {mainItems.map((item) => (
          <SidebarItem
            key={item.path}
            name={item.name}
            path={item.path}
            icon={item.icon}
            onClick={onItemClick}
          />
        ))}
      </nav>

      {isAdmin && (
        <>
          <div className="relative my-6 px-4">
            <Divider
              variant="gradient"
              spacing="lg"
              className="px-4"
            />
          </div>

          <SidebarSubHeader title="Administración" />

          <nav className="space-y-1.5">
            {adminItems.map((item) => (
              <SidebarItem
                key={item.path}
                name={item.name}
                path={item.path}
                icon={item.icon}
                onClick={onItemClick}
              />
            ))}
          </nav>
        </>
      )}
    </>
  );
}