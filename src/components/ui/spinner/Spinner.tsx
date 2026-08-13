import React from "react";
import { ring } from "ldrs";
import { spinnerVariants } from "./spinnerVariants";

ring.register();

interface SpinnerProps {
  size?: keyof typeof spinnerVariants.size;
  color?: keyof typeof spinnerVariants.color;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "primary",
}) => {
  const config = spinnerVariants.size[size];

  return (
    <l-ring
      size={config.size}
      stroke={config.stroke}
      speed="2"
      color={spinnerVariants.color[color]}
    />
  );
};

export default Spinner;