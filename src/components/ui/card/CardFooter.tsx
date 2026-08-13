import React from "react";
import { cn } from "@/utils/cn";

const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("p-4 pt-2 flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
};

export default CardFooter;