import React from "react";

interface TableEmptyProps {
  colSpan: number;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const TableEmpty: React.FC<TableEmptyProps> = ({ colSpan, title = "Sin resultados", description, icon }) => (
  <tr>
    <td colSpan={colSpan} className="px-4 py-12">
      <div className="flex flex-col items-center justify-center text-center gap-2">
        {icon && <span className="text-slate-300 dark:text-slate-600 mb-1">{icon}</span>}
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
        {description && <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">{description}</p>}
      </div>
    </td>
  </tr>
);

export default TableEmpty;