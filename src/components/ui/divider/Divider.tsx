import React from "react";

interface DividerProps {
  vertical?: boolean;

  variant?:
    | "default"
    | "gradient";

  spacing?:
    | "none"
    | "sm"
    | "md"
    | "lg";

  className?: string;
}

const spacingClasses = {
  none: "",
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
} as const;

const Divider:
  React.FC<DividerProps> = ({
    vertical = false,
    variant = "default",
    spacing = "md",
    className = "",
  }) => {
    if (vertical) {
      return (
        <div
          role="separator"
          aria-orientation="vertical"
          className={`
            w-px
            self-stretch
            bg-slate-200/80
            dark:bg-slate-700/60
            ${className}
          `}
        />
      );
    }

    return (
      <div
        className={`
          ${spacingClasses[spacing]}
          ${className}
        `}
      >
        <div
          role="separator"
          className={
            variant ===
            "gradient"
              ? "h-px w-full bg-linear-to-r from-transparent via-slate-300 to-transparent opacity-90 dark:via-slate-700/70"
              : "h-px w-full bg-slate-200/80 dark:bg-slate-700/60"
          }
        />
      </div>
    );
  };

export default Divider;