import React from "react";
import { cn } from "@/utils/cn";

const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead
    className={cn("bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700", className)}
    {...props}
  />
);

export default TableHead;