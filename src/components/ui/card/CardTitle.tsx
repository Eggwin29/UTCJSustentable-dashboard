import React from "react";
import { cn } from "@/utils/cn";
import { cardTextVariants } from "./cardVariants";
import { useCardVariant } from "./CardContext";

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
}

const CardTitle: React.FC<CardTitleProps> = ({
  as: Tag = "h3",
  className,
  children,
  ...props
}) => {
  const variant = useCardVariant();

  return (
    <Tag className={cn("text-lg font-semibold", cardTextVariants[variant], className)} {...props}>
      {children}
    </Tag>
  );
};

export default CardTitle;