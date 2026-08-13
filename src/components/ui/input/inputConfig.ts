import { cn } from "@/utils/cn";

export type InputSize = "sm" | "md" | "lg";
export type InputVariant = "outline" | "filled" | "underline";

export const sizeConfig: Record<
  InputSize,
  { height: string; inputPadding: string; text: string }
> = {
  sm: { height: "h-9", inputPadding: "px-3", text: "text-sm" },
  md: { height: "h-11", inputPadding: "px-4", text: "text-sm" },
  lg: { height: "h-12", inputPadding: "px-4", text: "text-base" },
};

export function getContainerClasses(variant: InputVariant, hasError: boolean): string {
  const errorBorder = "border-red-400 dark:border-red-500";

  switch (variant) {
    case "outline":
      return cn(
        "border-2 rounded-lg bg-transparent",
        hasError
          ? errorBorder
          : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 focus-within:border-emerald-600 dark:focus-within:border-emerald-500"
      );
    case "filled":
      return cn(
        "border-b-2 bg-slate-100 dark:bg-slate-800 rounded-t-lg",
        hasError
          ? errorBorder
          : "border-slate-300 dark:border-slate-600 focus-within:border-emerald-600 dark:focus-within:border-emerald-500"
      );
    case "underline":
      return cn(
        "border-b-2 bg-transparent rounded-none",
        hasError
          ? errorBorder
          : "border-slate-300 dark:border-slate-600 focus-within:border-emerald-600 dark:focus-within:border-emerald-500"
      );
  }
}