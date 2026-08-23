import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiChevronDown,
  FiSearch,
  FiX,
} from "react-icons/fi";

import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox/Checkbox";
import Input from "@/components/ui/input/Input";

import type {
  ReportSelection,
  ReportSelectionMode,
} from "@/types/reportes";

import { cn } from "@/utils/cn";

export interface ReportMultiSelectOption<
  T extends string | number,
> {
  value: T;
  label: string;
}

interface ReportMultiSelectProps<
  T extends string | number,
> {
  id: string;
  label: string;

  options:
    ReportMultiSelectOption<T>[];

  selection: ReportSelection<T>;

  onChange: (
    selection: ReportSelection<T>
  ) => void;

  placeholder?: string;
  helperText?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export default function ReportMultiSelect<
  T extends string | number,
>({
  id,
  label,
  options,
  selection,
  onChange,
  placeholder = "Todas las opciones",
  helperText,
  searchPlaceholder = "Buscar...",
  emptyMessage =
    "No se encontraron opciones.",
  disabled = false,
}: ReportMultiSelectProps<T>) {
  const generatedId = useId();

  const listboxId =
    `${id}-${generatedId}-listbox`;

  const rootRef =
    useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] =
    useState(false);

  const [query, setQuery] =
    useState("");

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        rootRef.current &&
        !rootRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const filteredOptions =
    useMemo(() => {
      const normalizedQuery = query
        .trim()
        .toLocaleLowerCase("es");

      if (!normalizedQuery) {
        return options;
      }

      return options.filter(
        (option) =>
          option.label
            .toLocaleLowerCase("es")
            .includes(
              normalizedQuery
            )
      );
    }, [options, query]);

  const selectedValues = new Set(
    selection.values
  );

  const selectedOptions =
    options.filter((option) =>
      selectedValues.has(
        option.value
      )
    );

  const summary =
    getSelectionSummary(
      selection.mode,
      selectedOptions.length,
      placeholder
    );

  const updateMode = (
    mode: ReportSelectionMode
  ) => {
    onChange({
      ...selection,
      mode,
    });
  };

  const toggleOption = (
    value: T
  ) => {
    const nextValues =
      selectedValues.has(value)
        ? selection.values.filter(
            (selectedValue) =>
              selectedValue !== value
          )
        : [
            ...selection.values,
            value,
          ];

    onChange({
      ...selection,
      values: nextValues,
    });
  };

  const selectVisible = () => {
    const nextValues = new Set(
      selection.values
    );

    for (
      const option
      of filteredOptions
    ) {
      nextValues.add(option.value);
    }

    onChange({
      ...selection,
      values:
        Array.from(nextValues),
    });
  };

  const clearSelection = () => {
    onChange({
      ...selection,
      values: [],
    });
  };

  return (
    <div
      ref={rootRef}
      className="w-full"
    >
      <label
        id={`${id}-label`}
        htmlFor={id}
        className="mb-1.5 block px-1 text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>

      <button
        type="button"
        id={id}
        aria-labelledby={
          `${id}-label ${id}`
        }
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() =>
          setIsOpen(
            (current) => !current
          )
        }
        className={cn(
          "flex min-h-10 w-full items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 py-2 text-left transition-colors",
          "hover:border-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
          "dark:border-slate-600 dark:bg-slate-900",
          disabled &&
            "cursor-not-allowed opacity-50"
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {summary}
          </span>

          {selectedOptions.length >
            0 && (
            <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
              {selectedOptions
                .slice(0, 3)
                .map(
                  (option) =>
                    option.label
                )
                .join(", ")}

              {selectedOptions.length >
              3
                ? ` y ${
                    selectedOptions.length -
                    3
                  } más`
                : ""}
            </span>
          )}
        </span>

        {selection.values.length >
          0 && (
          <Badge
            variant={
              selection.mode ===
              "include"
                ? "primary"
                : "secondary"
            }
            size="sm"
          >
            {selection.values.length}
          </Badge>
        )}

        <FiChevronDown
          className={cn(
            "shrink-0 text-slate-400 transition-transform",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {helperText && !isOpen && (
        <p className="mt-1.5 px-1 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}

      {isOpen && (
        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Cómo aplicar la selección
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant={
                  selection.mode ===
                  "include"
                    ? "primary"
                    : "outline"
                }
                onClick={() =>
                  updateMode(
                    "include"
                  )
                }
              >
                Mostrar marcados
              </Button>

              <Button
                type="button"
                size="sm"
                variant={
                  selection.mode ===
                  "exclude"
                    ? "danger"
                    : "outline"
                }
                onClick={() =>
                  updateMode(
                    "exclude"
                  )
                }
              >
                Excluir marcados
              </Button>
            </div>
          </div>

          {options.length > 6 && (
            <div className="mb-3">
              <Input
                id={`${id}-search`}
                name={`${id}-search`}
                value={query}
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target.value
                  )
                }
                leftIcon={
                  <FiSearch />
                }
                placeholder={
                  searchPlaceholder
                }
                clearable
                size="sm"
                autoComplete="off"
              />
            </div>
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={
                selectVisible
              }
              disabled={
                filteredOptions.length ===
                0
              }
            >
              Marcar visibles
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<FiX />}
              onClick={
                clearSelection
              }
              disabled={
                selection.values
                  .length === 0
              }
              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Limpiar selección
            </Button>
          </div>

          <div
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-700"
          >
            {filteredOptions.length ===
            0 ? (
              <p className="px-2 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {emptyMessage}
              </p>
            ) : (
              filteredOptions.map(
                (
                  option,
                  index
                ) => {
                  const isSelected =
                    selectedValues.has(
                      option.value
                    );

                  return (
                    <div
                      key={String(
                        option.value
                      )}
                      role="option"
                      aria-selected={
                        isSelected
                      }
                      className={cn(
                        "rounded-lg px-2 py-2 transition-colors",

                        isSelected &&
                          selection.mode ===
                            "include" &&
                          "bg-emerald-50 dark:bg-emerald-500/10",

                        isSelected &&
                          selection.mode ===
                            "exclude" &&
                          "bg-red-50 dark:bg-red-950/30"
                      )}
                    >
                      <Checkbox
                        id={`${id}-option-${index}`}
                        name={`${id}-options`}
                        label={
                          option.label
                        }
                        checked={
                          isSelected
                        }
                        onChange={() =>
                          toggleOption(
                            option.value
                          )
                        }
                      />
                    </div>
                  );
                }
              )
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selection.values
                .length === 0
                ? "Sin selección: se muestran todas."
                : selection.mode ===
                    "include"
                  ? "Solo se mostrarán las opciones marcadas."
                  : "Se mostrarán todas menos las opciones marcadas."}
            </p>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() =>
                setIsOpen(false)
              }
            >
              Listo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function getSelectionSummary(
  mode: ReportSelectionMode,
  selectedCount: number,
  placeholder: string
): string {
  if (selectedCount === 0) {
    return placeholder;
  }

  if (mode === "exclude") {
    return `Todo excepto ${selectedCount}`;
  }

  return `${selectedCount} ${
    selectedCount === 1
      ? "seleccionado"
      : "seleccionados"
  }`;
}