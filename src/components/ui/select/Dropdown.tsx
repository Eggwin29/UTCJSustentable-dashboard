import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  useDropdownValue,
} from "@/hooks/useDropdownValue";

import {
  cn,
} from "@/utils/cn";

import InputLabel from "../input/InputLabel";

import {
  getContainerClasses,
  sizeConfig,
} from "../input/inputConfig";

import type {
  InputSize,
  InputVariant,
} from "../input/inputConfig";

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (
    value: string | number
  ) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "top" | "bottom";
}

const MENU_GAP = 8;
const VIEWPORT_PADDING = 12;
const MAX_MENU_HEIGHT = 240;
const MIN_MENU_HEIGHT = 72;

const Dropdown:
  React.FC<SelectProps> = ({
    options,
    label,
    helperText,
    error,
    size = "md",
    variant = "outline",
    leftIcon,
    value,
    defaultValue,
    onChange,
    placeholder =
      "Selecciona una opción",
    disabled,
    className,
    id,
  }) => {
    const generatedId = useId();

    const dropdownId =
      id ?? generatedId;

    const listboxId =
      `${dropdownId}-listbox`;

    const hasError =
      Boolean(error);

    const config =
      sizeConfig[size];

    const rootRef =
      useRef<HTMLDivElement>(
        null
      );

    const triggerRef =
      useRef<HTMLButtonElement>(
        null
      );

    const menuRef =
      useRef<HTMLUListElement>(
        null
      );

    const [
      isOpen,
      setIsOpen,
    ] = useState(false);

    const [
      activeIndex,
      setActiveIndex,
    ] = useState(-1);

    const [
      menuPosition,
      setMenuPosition,
    ] =
      useState<MenuPosition | null>(
        null
      );

    const {
      currentValue,
      selectValue,
      hasValue,
    } = useDropdownValue({
      value,
      defaultValue,
      onChange,
    });

    const selectedOption =
      options.find(
        (option) =>
          option.value ===
          currentValue
      );

    const updateMenuPosition =
      useCallback(() => {
        const trigger =
          triggerRef.current;

        if (!trigger) {
          return;
        }

        const rect =
          trigger.getBoundingClientRect();

        const availableBelow =
          window.innerHeight -
          rect.bottom -
          MENU_GAP -
          VIEWPORT_PADDING;

        const availableAbove =
          rect.top -
          MENU_GAP -
          VIEWPORT_PADDING;

        const placement =
          availableBelow <
            MAX_MENU_HEIGHT &&
          availableAbove >
            availableBelow
            ? "top"
            : "bottom";

        const availableHeight =
          placement === "top"
            ? availableAbove
            : availableBelow;

        const maxHeight =
          Math.max(
            MIN_MENU_HEIGHT,
            Math.min(
              MAX_MENU_HEIGHT,
              availableHeight
            )
          );

        const width =
          Math.min(
            rect.width,
            window.innerWidth -
              VIEWPORT_PADDING *
                2
          );

        const left =
          Math.min(
            Math.max(
              rect.left,
              VIEWPORT_PADDING
            ),
            window.innerWidth -
              width -
              VIEWPORT_PADDING
          );

        setMenuPosition({
          top:
            placement === "top"
              ? rect.top -
                MENU_GAP
              : rect.bottom +
                MENU_GAP,
          left,
          width,
          maxHeight,
          placement,
        });
      }, []);

    useEffect(() => {
      function handleClickOutside(
        event: MouseEvent
      ) {
        const target =
          event.target as Node;

        const clickedTrigger =
          rootRef.current?.contains(
            target
          );

        const clickedMenu =
          menuRef.current?.contains(
            target
          );

        if (
          !clickedTrigger &&
          !clickedMenu
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

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      let animationFrame = 0;

      const requestPositionUpdate =
        () => {
          window.cancelAnimationFrame(
            animationFrame
          );

          animationFrame =
            window.requestAnimationFrame(
              updateMenuPosition
            );
        };

      window.addEventListener(
        "resize",
        requestPositionUpdate
      );

      document.addEventListener(
        "scroll",
        requestPositionUpdate,
        true
      );

      return () => {
        window.cancelAnimationFrame(
          animationFrame
        );

        window.removeEventListener(
          "resize",
          requestPositionUpdate
        );

        document.removeEventListener(
          "scroll",
          requestPositionUpdate,
          true
        );
      };
    }, [
      isOpen,
      updateMenuPosition,
    ]);

    const openMenu = () => {
      if (
        disabled ||
        options.length === 0
      ) {
        return;
      }

      setActiveIndex(
        options.findIndex(
          (option) =>
            option.value ===
            currentValue
        )
      );

      updateMenuPosition();
      setIsOpen(true);
    };

    const closeMenu = () => {
      setIsOpen(false);
    };

    const handleSelect = (
      option: SelectOption
    ) => {
      selectValue(option.value);
      closeMenu();

      triggerRef.current?.focus();
    };

    const handleKeyDown = (
      event: React.KeyboardEvent
    ) => {
      if (disabled) {
        return;
      }

      if (
        !isOpen &&
        (
          event.key === "Enter" ||
          event.key === " " ||
          event.key ===
            "ArrowDown"
        )
      ) {
        event.preventDefault();
        openMenu();
        return;
      }

      if (!isOpen) {
        return;
      }

      if (
        event.key === "Escape"
      ) {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (
        event.key ===
        "ArrowDown"
      ) {
        event.preventDefault();

        setActiveIndex(
          (previous) =>
            Math.min(
              previous + 1,
              options.length - 1
            )
        );

        return;
      }

      if (
        event.key === "ArrowUp"
      ) {
        event.preventDefault();

        setActiveIndex(
          (previous) =>
            Math.max(
              previous - 1,
              0
            )
        );

        return;
      }

      if (
        event.key === "Enter" &&
        activeIndex >= 0
      ) {
        event.preventDefault();

        handleSelect(
          options[activeIndex]
        );
      }
    };

    const dropdownMenu =
      isOpen && menuPosition
        ? createPortal(
            <ul
              ref={menuRef}
              id={listboxId}
              role="listbox"
              aria-label={
                label ??
                placeholder
              }
              style={{
                top:
                  menuPosition.top,
                left:
                  menuPosition.left,
                width:
                  menuPosition.width,
                maxHeight:
                  menuPosition.maxHeight,
              }}
              className={cn(
                "fixed z-[300] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white py-1 shadow-2xl shadow-slate-950/15",
                "dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/40",
                menuPosition.placement ===
                  "top" &&
                  "-translate-y-full origin-bottom",
                menuPosition.placement ===
                  "bottom" &&
                  "origin-top"
              )}
            >
              {options.map(
                (
                  option,
                  index
                ) => {
                  const isSelected =
                    option.value ===
                    currentValue;

                  const isActive =
                    index ===
                    activeIndex;

                  return (
                    <li
                      key={
                        option.value
                      }
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      aria-selected={
                        isSelected
                      }
                      onMouseEnter={() =>
                        setActiveIndex(
                          index
                        )
                      }
                      onClick={() =>
                        handleSelect(
                          option
                        )
                      }
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                        isSelected
                          ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "text-slate-700 dark:text-slate-200",
                        isActive &&
                          !isSelected &&
                          "bg-slate-100 dark:bg-slate-700/60"
                      )}
                    >
                      {option.icon && (
                        <span className="shrink-0 text-slate-400 dark:text-slate-500">
                          {
                            option.icon
                          }
                        </span>
                      )}

                      <span className="min-w-0 flex-1 truncate">
                        {
                          option.label
                        }
                      </span>
                    </li>
                  );
                }
              )}
            </ul>,
            document.body
          )
        : null;

    return (
      <div
        ref={rootRef}
        className="flex w-full flex-col gap-1.5"
      >
        {label && (
          <InputLabel
            htmlFor={dropdownId}
            label={label}
            hasError={hasError}
            disabled={disabled}
          />
        )}

        <div className="relative w-full">
          <button
            ref={triggerRef}
            type="button"
            id={dropdownId}
            onClick={() =>
              isOpen
                ? closeMenu()
                : openMenu()
            }
            onKeyDown={
              handleKeyDown
            }
            disabled={disabled}
            role="combobox"
            aria-expanded={
              isOpen
            }
            aria-haspopup="listbox"
            aria-controls={
              listboxId
            }
            aria-activedescendant={
              isOpen &&
              activeIndex >= 0
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            aria-invalid={
              hasError
            }
            aria-describedby={
              helperText || error
                ? `${dropdownId}-description`
                : undefined
            }
            className={cn(
              "peer relative flex w-full items-center text-left transition-colors duration-200",
              getContainerClasses(
                variant,
                hasError
              ),
              config.height,
              disabled &&
                "cursor-not-allowed opacity-50",
              !disabled &&
                "cursor-pointer",
              className
            )}
          >
            {leftIcon && (
              <span className="flex items-center pl-3 text-slate-400 dark:text-slate-500">
                {leftIcon}
              </span>
            )}

            <span
              className={cn(
                "flex-1 truncate",
                config.text,
                config.inputPadding,
                leftIcon
                  ? "pl-2"
                  : undefined,
                "pr-2",
                hasValue
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-slate-500"
              )}
            >
              {selectedOption
                ? selectedOption.label
                : placeholder}
            </span>

            <span
              className={cn(
                "flex items-center pr-3 text-slate-400 transition-transform duration-200 dark:text-slate-500",
                isOpen &&
                  "rotate-180"
              )}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </button>
        </div>

        {(helperText ||
          error) && (
          <p
            id={`${dropdownId}-description`}
            className={cn(
              "px-1 text-xs transition-colors",
              hasError
                ? "text-red-500"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            {error ||
              helperText}
          </p>
        )}

        {dropdownMenu}
      </div>
    );
  };

export default Dropdown;