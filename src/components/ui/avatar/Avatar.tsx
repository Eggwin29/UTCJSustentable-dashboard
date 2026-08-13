import React from "react";
import { getInitials } from "@/utils/getInitials";
import { cn } from "@/utils/cn";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "danger";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-xl",
};

const avatarVariants = {
  primary: "bg-emerald-600 text-white",
  secondary: "bg-slate-600 text-white",
  danger: "bg-red-600 text-white",
};

const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = "md",
  color = "primary",
  className,
}) => {
  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-full overflow-hidden flex items-center justify-center font-semibold select-none shrink-0",
        avatarVariants[color],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};

export default Avatar;