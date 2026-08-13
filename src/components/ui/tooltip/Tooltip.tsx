// components/ui/tooltip/HelpTooltip.tsx
import React, { useState, useId } from "react";
import { cn } from "@/utils/cn";
import { FiHelpCircle } from "react-icons/fi";

interface HelpTooltipProps {
  content: string;
  side?: "top" | "bottom";
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ content, side = "top" }) => {
  const [visible, setVisible] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={tooltipId}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <FiHelpCircle className="h-4 w-4" />
      </button>

      <span
        role="tooltip"
        id={tooltipId}
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-50 w-max max-w-56 rounded-md bg-slate-800 dark:bg-slate-700 px-2.5 py-1.5 text-xs leading-snug text-white shadow-lg transition-all duration-150 pointer-events-none",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        )}
      >
        {content}
      </span>
    </span>
  );
};

export default HelpTooltip;