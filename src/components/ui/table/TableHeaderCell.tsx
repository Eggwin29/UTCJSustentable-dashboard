import React from "react";
import { cn } from "@/utils/cn";

interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ className, align = "left", ...props }) => (
  <th
    scope="col"
    className={cn(
      "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
      align === "center" && "text-center",
      align === "right" && "text-right",
      className
    )}
    {...props}
  />
);

export default TableHeaderCell;