import React from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "outline";
type BadgeSize = "sm" | "md";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const badgeVariants: Record<BadgeVariant, string> = {
  primary: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  secondary: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  outline: "bg-transparent border border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300",
};

const dotColors: Record<BadgeVariant, string> = {
  primary: "bg-emerald-500",
  secondary: "bg-slate-500",
  success: "bg-green-500",
  danger: "bg-red-500",
  warning: "bg-amber-500",
  outline: "bg-slate-400",
};

const badgeSizes: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
};

const Badge: React.FC<BadgeProps> = ({
  variant = "primary",
  size = "sm",
  dot = false,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium w-fit select-none",
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />
      )}
      {children}
    </span>
  );
};

export default Badge;