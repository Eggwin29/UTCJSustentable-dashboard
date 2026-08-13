import React from "react";
import { cn } from "@/utils/cn";
import { cardTextVariants } from "./cardVariants";
import { useCardVariant } from "./CardContext";

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "default" | "sm";
}

const sizeClasses = {
  default: "text-sm",
  sm: "text-xs",
};

const CardDescription: React.FC<CardDescriptionProps> = ({
  size = "default",
  className,
  children,
  ...props
}) => {
  const variant = useCardVariant();

  return (
    <p
      className={cn(
        sizeClasses[size],
        "opacity-80", // atenúa un poco respecto al título, sin perder el color del variant
        cardTextVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

export default CardDescription;