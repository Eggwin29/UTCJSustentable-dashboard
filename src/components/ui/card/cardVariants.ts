export type CardVariant =
  | "elevated"
  | "outlined"
  | "flat"
  | "highlight";

export const cardVariants:
  Record<
    CardVariant,
    string
  > = {
    elevated:
      "bg-white dark:bg-slate-900 shadow-md",

    outlined:
      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700",

    flat:
      "bg-slate-50 dark:bg-slate-950/60",

    highlight:
      "bg-emerald-600 dark:bg-emerald-700",
  };

export const cardTextVariants:
  Record<
    CardVariant,
    string
  > = {
    elevated:
      "text-slate-900 dark:text-white",

    outlined:
      "text-slate-900 dark:text-white",

    flat:
      "text-slate-900 dark:text-white",

    highlight:
      "text-white",
  };