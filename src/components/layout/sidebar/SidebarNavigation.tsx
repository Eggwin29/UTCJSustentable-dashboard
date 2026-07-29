import SidebarItem from "@/components/layout/sidebar/SidebarItem";
import { navigation } from "@/constants/navigation.config";
import SidebarSubHeader from "./SidebarSubHeader"

interface SidebarNavigationProps {
  onItemClick?: () => void;
}

export default function SidebarNavigation({
  onItemClick,
}: SidebarNavigationProps) {
  return (
    <>
    <SidebarSubHeader title='Hola'/>
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
    <div 
        className="h-px w-full bg-linear-to-r from-transparent via-slate-700 to-transparent opacity-70"
        role="separator"
    />
    </div>
    <SidebarSubHeader title='Adios'/>
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