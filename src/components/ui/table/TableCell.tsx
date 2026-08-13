import React from "react";
import { cn } from "@/utils/cn";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
}

const TableCell: React.FC<TableCellProps> = ({ className, align = "left", ...props }) => (
  <td
    className={cn(
      "px-4 py-3 text-slate-700 dark:text-slate-300",
      align === "center" && "text-center",
      align === "right" && "text-right",
      className
    )}
    {...props}
  />
);

export default TableCell;