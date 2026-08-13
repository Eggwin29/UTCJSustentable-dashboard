// components/ui/skeleton/Skeleton.tsx
import React from "react";
import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rect";
}

const Skeleton: React.FC<SkeletonProps> = ({ className, variant = "rect" }) => (
  <div
    className={cn(
      "animate-pulse bg-slate-200 dark:bg-slate-700",
      variant === "text" && "h-4 rounded",
      variant === "circle" && "rounded-full",
      variant === "rect" && "rounded-lg",
      className
    )}
  />
);

export default Skeleton;