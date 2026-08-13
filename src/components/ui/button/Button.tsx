import React from "react";
import { buttonVariants } from "./buttonVariants";
import { cn } from "@/utils/cn";
import Spinner from "@/components/ui/spinner/Spinner";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,

  variant = "primary",
  size = "md",

  leftIcon,
  rightIcon,

  loading = false,

  className,

  disabled,

  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 cursor-pointer",
        "disabled:opacity-50 disabled:pointer-events-none",
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      {...props}
    >
      {loading ? (
    <Spinner
        size="sm"
        color="current"
    />
) : (
    leftIcon
)}

      {children}

      {!loading && rightIcon}
    </button>
  );
};

export default Button;