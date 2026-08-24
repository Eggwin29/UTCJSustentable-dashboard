export const buttonVariants = {
  variant: {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",

    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:active:bg-slate-600",

    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",

    ghost:
      "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",

    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500 dark:active:bg-red-700",
  },

  size: {
    sm:
      "h-8 px-3 text-xs",

    md:
      "h-10 px-4 text-sm",

    lg:
      "h-12 px-6 text-base",
  },
} as const;