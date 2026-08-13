import React from "react";
import { cn } from "@/utils/cn";

const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("p-4 pb-2 flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
};

export default CardHeader;