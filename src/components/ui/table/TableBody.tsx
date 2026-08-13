import React from "react";
import { cn } from "@/utils/cn";

const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn("divide-y divide-slate-100 dark:divide-slate-800", className)} {...props} />
);

export default TableBody;