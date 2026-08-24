import type {
  ReactNode,
} from "react";

import Skeleton from "@/components/ui/skeleton/Skeleton";
import { cn } from "@/utils/cn";

type StatCardAccent =
  | "emerald"
  | "sky"
  | "violet"
  | "amber";

interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  isLoading?: boolean;
  accent?: StatCardAccent;
  decimals?: number;
  icon?: ReactNode;
  helper?: string;
  className?: string;
}

const accentStyles: Record<
  StatCardAccent,
  {
    value: string;
    icon: string;
    line: string;
  }
> = {
  emerald: {
    value:
      "text-emerald-600 dark:text-emerald-400",
    icon:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    line: "bg-emerald-500",
  },

  sky: {
    value:
      "text-sky-600 dark:text-sky-400",
    icon:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    line: "bg-sky-500",
  },

  violet: {
    value:
      "text-violet-600 dark:text-violet-400",
    icon:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    line: "bg-violet-500",
  },

  amber: {
    value:
      "text-amber-600 dark:text-amber-400",
    icon:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    line: "bg-amber-500",
  },
};

export default function StatCard({
  label,
  value,
  unit,
  isLoading,
  accent = "emerald",
  decimals = 2,
  icon,
  helper,
  className,
}: StatCardProps) {
  const styles =
    accentStyles[accent];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900",
        className
      )}
    >
      <span
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          styles.line
        )}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          {isLoading ? (
            <Skeleton className="mt-3 h-9 w-36" />
          ) : (
            <p
              className={cn(
                "mt-2 text-3xl font-bold tracking-tight",
                styles.value
              )}
            >
              {value.toLocaleString(
                "es-MX",
                {
                  minimumFractionDigits:
                    decimals,

                  maximumFractionDigits:
                    decimals,
                }
              )}

              {unit && (
                <span className="ml-1 text-base font-semibold">
                  {unit}
                </span>
              )}
            </p>
          )}
        </div>

        {icon && (
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl",
              styles.icon
            )}
          >
            {icon}
          </span>
        )}
      </div>

      {helper && (
        <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {helper}
        </p>
      )}
    </div>
  );
}