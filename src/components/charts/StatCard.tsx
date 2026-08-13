import React from "react";
import { cn } from "@/utils/cn";
import Skeleton from "@/components/ui/skeleton/Skeleton";

interface StatCardProps {
  label: string;
  value: number;
  unit?: string;
  isLoading?: boolean;
  accent?: "emerald" | "sky";
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, isLoading, accent = "emerald" }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center">
    {isLoading ? (
      <Skeleton className="h-10 w-40 mx-auto" />
    ) : (
      <p
        className={cn(
          "text-4xl font-bold",
          accent === "emerald" ? "text-emerald-600 dark:text-emerald-500" : "text-sky-600 dark:text-sky-500"
        )}
      >
        {value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    )}
    <p className="mt-2 text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

export default StatCard;