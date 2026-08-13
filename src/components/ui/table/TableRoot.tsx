import React from "react";
import { cn } from "@/utils/cn";

const TableRoot: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div
    className={cn(
      "w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
      className
    )}
    {...props}
  >
    <table className="w-full text-sm text-left border-collapse">{children}</table>
  </div>
);

export default TableRoot;