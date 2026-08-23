import { useEffect } from "react";

import {
  useLocation,
} from "react-router-dom";

const MAX_FIND_ATTEMPTS = 90;

export function useScrollToHash():
  void {
  const location = useLocation();

  useEffect(() => {
    const hash = decodeURIComponent(
      location.hash.replace(
        /^#/,
        ""
      )
    );

    const mainScrollContainer =
      document.querySelector<HTMLElement>(
        "[data-main-scroll-container]"
      );

    if (!hash) {
      mainScrollContainer?.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    let animationFrameId = 0;
    let attempts = 0;
    let cancelled = false;

    const findAndScroll = () => {
      if (cancelled) {
        return;
      }

      const target =
        document.getElementById(hash);

      if (!target) {
        attempts += 1;

        if (
          attempts <
          MAX_FIND_ATTEMPTS
        ) {
          animationFrameId =
            window.requestAnimationFrame(
              findAndScroll
            );
        }

        return;
      }

      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      target.focus({
        preventScroll: true,
      });

      if (
        typeof target.animate ===
        "function"
      ) {
        target.animate(
          [
            {
              outline:
                "3px solid rgba(16, 185, 129, 0)",

              outlineOffset:
                "8px",
            },
            {
              outline:
                "3px solid rgba(16, 185, 129, 0.85)",

              outlineOffset:
                "4px",
            },
            {
              outline:
                "3px solid rgba(16, 185, 129, 0)",

              outlineOffset:
                "8px",
            },
          ],
          {
            duration: 1800,
            easing: "ease-out",
          }
        );
      }
    };

    animationFrameId =
      window.requestAnimationFrame(
        findAndScroll
      );

    return () => {
      cancelled = true;

      window.cancelAnimationFrame(
        animationFrameId
      );
    };
  }, [
    location.hash,
    location.key,
    location.pathname,
    location.state,
  ]);
}