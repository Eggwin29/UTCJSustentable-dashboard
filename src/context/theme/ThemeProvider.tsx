import {
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ThemeContext,
  type ColorTheme,
} from "./ThemeContext";

const THEME_STORAGE_KEY =
  "utcj-sustentable-theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [
    theme,
    setTheme,
  ] = useState<ColorTheme>(
    getInitialTheme
  );

  const isDarkMode =
    theme === "dark";

  useLayoutEffect(() => {
    const root =
      document.documentElement;

    root.classList.toggle(
      "dark",
      isDarkMode
    );

    root.style.colorScheme =
      theme;

    try {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        theme
      );
    } catch {
      // La aplicación puede funcionar
      // aunque localStorage esté bloqueado.
    }

    const themeColor =
      document.querySelector<HTMLMetaElement>(
        'meta[name="theme-color"]'
      );

    themeColor?.setAttribute(
      "content",
      isDarkMode
        ? "#020617"
        : "#065f46"
    );
  }, [
    isDarkMode,
    theme,
  ]);

  const value =
    useMemo(
      () => ({
        theme,
        isDarkMode,

        setDarkMode: (
          enabled: boolean
        ) => {
          setTheme(
            enabled
              ? "dark"
              : "light"
          );
        },

        toggleDarkMode: () => {
          setTheme(
            (current) =>
              current === "dark"
                ? "light"
                : "dark"
          );
        },
      }),
      [
        isDarkMode,
        theme,
      ]
    );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

function getInitialTheme():
  ColorTheme {
  if (
    typeof window ===
    "undefined"
  ) {
    return "light";
  }

  try {
    const storedTheme =
      window.localStorage.getItem(
        THEME_STORAGE_KEY
      );

    if (
      storedTheme === "light" ||
      storedTheme === "dark"
    ) {
      return storedTheme;
    }
  } catch {
    // Continúa con la
    // preferencia del sistema.
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}