import {
  FiLayers,
} from "react-icons/fi";

import {
  MdOutlineDashboard,
  MdBarChart,
} from "react-icons/md";

import {
  LuUsersRound,
} from "react-icons/lu";

import {
  GoGear,
} from "react-icons/go";

import type {
  IconType,
} from "react-icons";

export interface NavigationItem {
  name: string;
  path: string;
  type: "main" | "admin";
  icon: IconType;
}

export const navigation:
  NavigationItem[] = [
  {
    name: "Dashboard",
    path: "/",
    type: "main",
    icon: MdOutlineDashboard,
  },
  {
    name: "Colecciones",
    path: "/collections",
    type: "main",
    icon: FiLayers,
  },
  {
    name: "Reportes",
    path: "/reports",
    type: "main",
    icon: MdBarChart,
  },
  {
    name: "Usuarios",
    path: "/users",
    type: "admin",
    icon: LuUsersRound,
  },
  {
    name: "Configuración",
    path: "/settings",
    type: "admin",
    icon: GoGear,
  },
];