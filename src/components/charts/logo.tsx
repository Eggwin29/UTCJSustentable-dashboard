// logo.tsx
import React from "react";

interface LogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({
  width = 75,
  height = 75,
  className,
  style,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width={width}
    height={height}
    className={className}
    style={style}
    role="img"
    aria-label="Isotipo UTCJ"
  >
    <defs>
      <linearGradient id="sidePetalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#66BB6A" />
        <stop offset="100%" stopColor="#388E3C" />
      </linearGradient>
      <linearGradient id="centerPetalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#C8E6C9" />
        <stop offset="100%" stopColor="#81C784" />
      </linearGradient>
    </defs>

    <g transform="translate(50, 50)">
      {/* Fondo: representa la ecologia */}
      <circle cx="0" cy="0" r="36" fill="#1B5E20" />

      {/* Tallo */}
      <path
        d="M 0 20 L 0 32"
        stroke="#43A047"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Lobulo izquierdo de la cresta: abstraccion de Celosia cristata */}
      <path
        d="M4 20 C9 12,1 8,7 0 C10 -6,2 -12,0 -20 C-2 -12,-10 -6,-7 0 C-1 8,-9 12,-4 20 Z"
        fill="url(#sidePetalGradient)"
        transform="rotate(-36 0 20)"
      />
      {/* Lobulo derecho de la cresta */}
      <path
        d="M4 20 C9 12,1 8,7 0 C10 -6,2 -12,0 -20 C-2 -12,-10 -6,-7 0 C-1 8,-9 12,-4 20 Z"
        fill="url(#sidePetalGradient)"
        transform="rotate(36 0 20)"
      />

      {/* Lobulo central, mas alto: simboliza la sabiduria */}
      <path
        d="M4 20 C10 12,1 6,9 -2 C13 -10,2 -16,0 -32 C-2 -16,-13 -10,-9 -2 C-1 6,-10 12,-4 20 Z"
        fill="url(#centerPetalGradient)"
      />
    </g>
  </svg>
);

export default Logo;