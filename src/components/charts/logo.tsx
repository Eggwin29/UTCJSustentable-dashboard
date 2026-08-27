import React from "react";

import logoSustentable from "@/assets/logo/Logo.png";

interface LogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({
  width = 96,
  height = 90,
  className,
  style,
  alt = "UTCJ Sustentable",
}) => {
  const classes = [
    "block shrink-0 object-contain",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <img
      src={logoSustentable}
      alt={alt}
      width={width}
      height={height}
      className={classes}
      style={{
        objectFit: "contain",
        ...style,
      }}
      decoding="async"
      draggable={false}
    />
  );
};

export default Logo;