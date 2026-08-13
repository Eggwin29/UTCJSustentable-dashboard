// hooks/useMediaQuery.ts
import { useEffect, useState } from "react";

/**
 * Devuelve true/false segun si el media query dado hace match.
 * Ej: useMediaQuery("(min-width: 768px)") -> true en desktop.
 * Se re-evalua automaticamente si el usuario redimensiona la
 * ventana o gira el dispositivo.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQueryList.matches);

    handleChange();
    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}