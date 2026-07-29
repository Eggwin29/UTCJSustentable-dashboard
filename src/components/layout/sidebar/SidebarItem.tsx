import { NavLink } from "react-router-dom";
import type { IconType } from "react-icons";

interface SidebarItemProps {
  name: string;
  path: string;
  icon: IconType;
  onClick?: () => void;
}

export default function SidebarItem({
  name,
  path,
  icon: Icon,
  onClick,
}: SidebarItemProps) {
  return (
    <NavLink
      to={path}
      end={path === "/"}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3.5 px-3.5 py-2.5 rounded-r-xl text-xs font-semibold transition-colors duration-200 ${
          isActive
            ? "bg-emerald-600/40 hover:bg-emerald-600 text-white shadow-md shadow-emerald-600/20 border-l-4"
            : "text-slate-400 hover:text-white hover:bg-slate-800/60 hover:border-l-4"
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span>{name}</span>
    </NavLink>
  );
}