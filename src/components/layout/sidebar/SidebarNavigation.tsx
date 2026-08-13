import SidebarItem from "@/components/layout/sidebar/SidebarItem";
import { navigation } from "@/constants/navigation";
import SidebarSubHeader from "./SidebarSubHeader";
import Divider from "@/components/ui/divider";

interface SidebarNavigationProps {
  onItemClick?: () => void;
}

export default function SidebarNavigation({
  onItemClick,
}: SidebarNavigationProps) {
  return (
    <>
    <SidebarSubHeader title='Principal'/>
    <nav className="space-y-1.5">
      {navigation
        .filter((item) => item.type === "main")
        .map((item) => (
          <SidebarItem
            key={item.path}
            name={item.name}  
            path={item.path}
            icon={item.icon}
            onClick={onItemClick}
          />
        ))}
    </nav>
    <div className="relative my-6 px-4">
  {/* Esta es la línea plana con degradado */}
    <Divider
    variant="gradient"
    spacing="lg"
    className="px-4"
    />
    </div>
    <SidebarSubHeader title='Administración'/>
    <nav className="space-y-1.5">
      {navigation
        .filter((item) => item.type === "admin")
        .map((item) => (
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

  );
}