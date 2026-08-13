import React from "react";
import { cn } from "@/utils/cn";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean;
}

const TableRow: React.FC<TableRowProps> = ({ className, clickable, ...props }) => (
  <tr
    className={cn(
      "transition-colors",
      clickable && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50",
      className
    )}
    {...props}
  />
);

export default TableRow;