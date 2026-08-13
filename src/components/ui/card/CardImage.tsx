import React from "react";
import { cn } from "@/utils/cn";

const CardImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({
  className,
  alt = "",
  ...props
}) => {
  return (
    <img className={cn("w-full h-auto object-cover", className)} alt={alt} {...props} />
  );
};

export default CardImage;