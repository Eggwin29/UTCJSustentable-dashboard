import {
  createContext,
} from "react";

export type ColorTheme =
  | "light"
  | "dark";

export interface ThemeContextValue {
  theme: ColorTheme;
  isDarkMode: boolean;

  setDarkMode: (
    enabled: boolean
  ) => void;

  toggleDarkMode: () => void;
}

export const ThemeContext =
  createContext<
    ThemeContextValue | undefined
  >(undefined);