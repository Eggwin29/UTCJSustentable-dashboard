import React from "react";
import { cn } from "@/utils/cn";
import { cardVariants } from "./cardVariants";
import type { CardVariant } from "./cardVariants";
import { CardVariantProvider } from "./CardContext";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const Card: React.FC<CardProps> = ({
  variant = "elevated",
  className,
  children,
  ...props
}) => {
  return (
    <CardVariantProvider value={variant}>
      <div
        className={cn("rounded-xl overflow-hidden w-full", cardVariants[variant], className)}
        {...props}
      >
        {children}
      </div>
    </CardVariantProvider>
  );
};

Card.displayName = "Card";

export default Card;