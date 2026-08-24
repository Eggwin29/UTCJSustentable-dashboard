import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { cn } from "@/utils/cn";

type PaginationItem =
  | number
  | "start-ellipsis"
  | "end-ellipsis";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (
    pageSize: number
  ) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className,
}: PaginationProps) {
  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / pageSize)
  );

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const firstVisibleItem =
    totalItems === 0
      ? 0
      : (safeCurrentPage - 1) *
          pageSize +
        1;

  const lastVisibleItem = Math.min(
    safeCurrentPage * pageSize,
    totalItems
  );

  const canGoBack =
    safeCurrentPage > 1;

  const canGoForward =
    safeCurrentPage < totalPages;

  const minimumPageSize = Math.min(
    ...pageSizeOptions
  );

  const showPageSizeSelector =
    Boolean(onPageSizeChange) &&
    totalItems > minimumPageSize;

  if (
    totalPages <= 1 &&
    !showPageSizeSelector
  ) {
    return null;
  }

  const pageItems = getPageItems(
    totalPages,
    safeCurrentPage
  );

  return (
    <nav
      aria-label="Paginación de la tabla"
      className={cn(
        "mt-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p
          className="text-sm text-slate-500 dark:text-slate-400"
          aria-live="polite"
        >
          Mostrando{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {firstVisibleItem}–
            {lastVisibleItem}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {totalItems}
          </span>
        </p>

        {showPageSizeSelector && (
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            Filas por página

            <select
              name="pagination-page-size"
              value={pageSize}
              onChange={(event) =>
                onPageSizeChange?.(
                  Number(
                    event.target.value
                  )
                )
              }
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none transition-colors hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              {pageSizeOptions.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                )
              )}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <button
          type="button"
          disabled={!canGoBack}
          onClick={() =>
            onPageChange(
              safeCurrentPage - 1
            )
          }
          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
          aria-label="Ir a la página anterior"
        >
          <FiChevronLeft
            aria-hidden="true"
          />

          <span className="hidden md:inline">
            Anterior
          </span>
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {pageItems.map((item) => {
            if (
              item ===
                "start-ellipsis" ||
              item === "end-ellipsis"
            ) {
              return (
                <span
                  key={item}
                  className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-sm text-slate-400"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const isCurrent =
              item === safeCurrentPage;

            return (
              <button
                key={item}
                type="button"
                aria-label={`Ir a la página ${item}`}
                aria-current={
                  isCurrent
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  onPageChange(item)
                }
                className={
                  isCurrent
                    ? "inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-emerald-600 px-2 text-sm font-semibold text-white shadow-sm"
                    : "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-transparent px-2 text-sm font-medium text-slate-600 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
                }
              >
                {item}
              </button>
            );
          })}
        </div>

        <span className="px-2 text-sm font-medium text-slate-600 sm:hidden dark:text-slate-300">
          {safeCurrentPage} / {totalPages}
        </span>

        <button
          type="button"
          disabled={!canGoForward}
          onClick={() =>
            onPageChange(
              safeCurrentPage + 1
            )
          }
          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
          aria-label="Ir a la página siguiente"
        >
          <span className="hidden md:inline">
            Siguiente
          </span>

          <FiChevronRight
            aria-hidden="true"
          />
        </button>
      </div>
    </nav>
  );
}

function getPageItems(
  totalPages: number,
  currentPage: number
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  if (currentPage <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "end-ellipsis",
      totalPages,
    ];
  }

  if (
    currentPage >= totalPages - 3
  ) {
    return [
      1,
      "start-ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "start-ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "end-ellipsis",
    totalPages,
  ];
}