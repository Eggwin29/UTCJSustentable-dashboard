import {
  NavLink,
} from "react-router-dom";

import type {
  IconType,
} from "react-icons";

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
      className={({
        isActive,
      }) =>
        `flex items-center gap-3.5 rounded-r-xl border-l-4 px-3.5 py-2.5 text-xs font-semibold transition-colors duration-200 ${
          isActive
            ? "border-l-emerald-600 bg-slate-800/90 text-slate-100 shadow-sm shadow-black/20 hover:bg-slate-800"
            : "border-l-transparent text-slate-400 hover:border-l-slate-600 hover:bg-slate-800/60 hover:text-slate-100"
        }`
      }
    >
      <Icon className="h-5 w-5" />

      <span>{name}</span>
    </NavLink>
  );
}