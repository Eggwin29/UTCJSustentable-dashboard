import React from "react";

import { cn } from "@/utils/cn";
import Skeleton from "@/components/ui/skeleton/Skeleton";

interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  isLoading?: boolean;
  accent?: "emerald" | "sky";
  decimals?: number;
}

const StatCard: React.FC<
  StatCardProps
> = ({
  label,
  value,
  unit,
  isLoading,
  accent = "emerald",
  decimals = 2,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
    {isLoading ? (
      <Skeleton className="mx-auto h-10 w-40" />
    ) : (
      <p
        className={cn(
          "text-4xl font-bold",
          accent === "emerald"
            ? "text-emerald-600 dark:text-emerald-500"
            : "text-sky-600 dark:text-sky-500"
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
          <span className="ml-1 text-lg">
            {unit}
          </span>
        )}
      </p>
    )}

    <p className="mt-2 text-slate-500 dark:text-slate-400">
      {label}
    </p>
  </div>
);

export default StatCard;