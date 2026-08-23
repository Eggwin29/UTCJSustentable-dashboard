import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiActivity,
  FiArrowUpRight,
  FiBarChart2,
  FiClock,
  FiHome,
  FiSearch,
  FiSettings,
  FiX,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import {
  GLOBAL_SEARCH_ITEMS,
} from "@/constants/globalSearch";

import type {
  GlobalSearchCategory,
  GlobalSearchItem,
} from "@/constants/globalSearch";

import type { UserRole } from "@/types/profile";

import { cn } from "@/utils/cn";

interface GlobalSearchProps {
  role: UserRole | null;
  isRoleLoading?: boolean;
}

const RECENT_SEARCHES_KEY =
  "utcj-global-search-recent";

const MAX_RESULTS = 8;
const MAX_RECENT_RESULTS = 4;

export default function GlobalSearch({
  role,
  isRoleLoading = false,
}: GlobalSearchProps) {
  const navigate = useNavigate();

  const rootRef =
    useRef<HTMLDivElement>(null);

  const desktopInputRef =
    useRef<HTMLInputElement>(null);

  const mobileInputRef =
    useRef<HTMLInputElement>(null);

  const [query, setQuery] =
    useState("");

  const [desktopOpen, setDesktopOpen] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [recentIds, setRecentIds] =
    useState<string[]>(
      readRecentSearches
    );

  const availableItems = useMemo(
    () =>
      GLOBAL_SEARCH_ITEMS.filter(
        (item) => {
          if (!item.roles) {
            return true;
          }

          if (
            isRoleLoading ||
            !role
          ) {
            return false;
          }

          return item.roles.includes(
            role
          );
        }
      ),
    [isRoleLoading, role]
  );

  const results = useMemo(() => {
    const normalizedQuery =
      normalizeSearchText(
        query.trim()
      );

    if (normalizedQuery) {
      return availableItems
        .map((item) => ({
          item,
          score: getSearchScore(
            item,
            normalizedQuery
          ),
        }))
        .filter(
          (
            result
          ): result is {
            item: GlobalSearchItem;
            score: number;
          } => result.score !== null
        )
        .sort(
          (a, b) =>
            a.score - b.score ||
            a.item.title.localeCompare(
              b.item.title,
              "es"
            )
        )
        .slice(0, MAX_RESULTS)
        .map(
          (result) => result.item
        );
    }

    const recentItems = recentIds
      .map((id) =>
        availableItems.find(
          (item) =>
            item.id === id
        )
      )
      .filter(
        (
          item
        ): item is GlobalSearchItem =>
          Boolean(item)
      )
      .slice(
        0,
        MAX_RECENT_RESULTS
      );

    const recentItemIds =
      new Set(
        recentItems.map(
          (item) => item.id
        )
      );

    const quickAccessItems =
      availableItems.filter(
        (item) =>
          item.category ===
            "Navegación" &&
          !recentItemIds.has(
            item.id
          )
      );

    return [
      ...recentItems,
      ...quickAccessItems,
    ].slice(0, MAX_RESULTS);
  }, [
    availableItems,
    query,
    recentIds,
  ]);

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
        setDesktopOpen(false);
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
    function handleGlobalKeyDown(
      event: KeyboardEvent
    ) {
      const target =
        event.target as HTMLElement | null;

      const isEditableTarget =
        target?.isContentEditable ||
        target?.tagName ===
          "INPUT" ||
        target?.tagName ===
          "TEXTAREA" ||
        target?.tagName ===
          "SELECT";

      const isSlashShortcut =
        event.key === "/" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !isEditableTarget;

      const isAltKShortcut =
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        event.key.toLowerCase() ===
          "k";

      if (
        isSlashShortcut ||
        isAltKShortcut
      ) {
        event.preventDefault();

        if (
          window.matchMedia(
            "(max-width: 767px)"
          ).matches
        ) {
          setMobileOpen(true);

          window.requestAnimationFrame(
            () =>
              mobileInputRef.current?.focus()
          );
        } else {
          setDesktopOpen(true);

          window.requestAnimationFrame(
            () =>
              desktopInputRef.current?.focus()
          );
        }
      }

      if (
        event.key === "Escape"
      ) {
        setDesktopOpen(false);
        setMobileOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleGlobalKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleGlobalKeyDown
      );
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    window.requestAnimationFrame(
      () =>
        mobileInputRef.current?.focus()
    );
  }, [mobileOpen]);

  const handleQueryChange = (
    value: string
  ) => {
    setQuery(value);
    setActiveIndex(0);
  };

  const closeSearch = () => {
    setDesktopOpen(false);
    setMobileOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const handleSelect = (
    item: GlobalSearchItem
  ) => {
    const nextRecentIds = [
      item.id,
      ...recentIds.filter(
        (id) => id !== item.id
      ),
    ].slice(
      0,
      MAX_RECENT_RESULTS
    );

    setRecentIds(nextRecentIds);
    saveRecentSearches(
      nextRecentIds
    );

    const destination =
      item.hash
        ? `${item.path}#${item.hash}`
        : item.path;

    navigate(destination, {
      state: {
        globalSearchTarget:
          item.hash ?? null,
        globalSearchTimestamp:
          Date.now(),
      },
    });

    closeSearch();
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      setActiveIndex(
        (current) =>
          Math.min(
            current + 1,
            Math.max(
              results.length - 1,
              0
            )
          )
      );
    }

    if (
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      setActiveIndex(
        (current) =>
          Math.max(
            current - 1,
            0
          )
      );
    }

    if (
      event.key === "Enter" &&
      results[activeIndex]
    ) {
      event.preventDefault();

      handleSelect(
        results[activeIndex]
      );
    }

    if (
      event.key === "Escape"
    ) {
      closeSearch();
    }
  };

  const openMobileSearch =
    () => {
      setMobileOpen(true);
      setActiveIndex(0);
    };

  const showDesktopResults =
    desktopOpen ||
    query.trim().length > 0;

  return (
    <div
      ref={rootRef}
      className="relative z-[70]"
    >
      <div className="relative hidden md:block">
        <FiSearch
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />

        <input
          ref={desktopInputRef}
          id="global-search-desktop"
          name="global-search-desktop"
          type="search"
          role="combobox"
          aria-label="Buscar secciones"
          aria-expanded={
            showDesktopResults
          }
          aria-controls="global-search-desktop-results"
          aria-autocomplete="list"
          aria-activedescendant={
            showDesktopResults &&
            results[activeIndex]
              ? `global-search-desktop-results-option-${results[activeIndex].id}`
              : undefined
          }
          autoComplete="off"
          value={query}
          placeholder="Buscar secciones..."
          onFocus={() => {
            setDesktopOpen(true);
            setActiveIndex(0);
          }}
          onClick={() => {
            setDesktopOpen(true);
          }}
          onChange={(event) => {
            setDesktopOpen(true);

            handleQueryChange(
              event.target.value
            );
          }}
          onKeyDown={
            handleInputKeyDown
          }
          className="w-72 rounded-xl border border-transparent bg-slate-100/70 py-2 pl-10 pr-16 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:outline-none"
        />

        <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400 xl:flex">
          /
        </span>

        {showDesktopResults && (
          <SearchResults
            id="global-search-desktop-results"
            query={query}
            results={results}
            recentIds={
              recentIds
            }
            activeIndex={
              activeIndex
            }
            onActiveIndexChange={
              setActiveIndex
            }
            onSelect={
              handleSelect
            }
            className="absolute left-0 top-full z-[100] mt-2 w-[30rem]"
          />
        )}
      </div>

      <button
        type="button"
        onClick={
          openMobileSearch
        }
        className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600 md:hidden"
        aria-label="Abrir buscador global"
      >
        <FiSearch className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 p-3 backdrop-blur-sm md:hidden">
          <div className="mx-auto flex max-h-[calc(100vh-1.5rem)] max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-700">
              <div className="relative min-w-0 flex-1">
                <FiSearch
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />

                <input
                  ref={mobileInputRef}
                  id="global-search-mobile"
                  name="global-search-mobile"
                  type="search"
                  role="combobox"
                  aria-label="Buscar secciones"
                  aria-expanded="true"
                  aria-controls="global-search-mobile-results"
                  aria-autocomplete="list"
                  aria-activedescendant={
                    results[
                      activeIndex
                    ]
                      ? `global-search-mobile-results-option-${results[activeIndex].id}`
                      : undefined
                  }
                  autoComplete="off"
                  value={query}
                  placeholder="Buscar secciones y gráficas..."
                  onChange={(
                    event
                  ) =>
                    handleQueryChange(
                      event.target
                        .value
                    )
                  }
                  onKeyDown={
                    handleInputKeyDown
                  }
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={
                  closeSearch
                }
                className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Cerrar buscador"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <SearchResults
              id="global-search-mobile-results"
              query={query}
              results={results}
              recentIds={
                recentIds
              }
              activeIndex={
                activeIndex
              }
              onActiveIndexChange={
                setActiveIndex
              }
              onSelect={
                handleSelect
              }
              className="min-h-0 flex-1 overflow-y-auto border-0 shadow-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchResultsProps {
  id: string;
  query: string;
  results: GlobalSearchItem[];
  recentIds: string[];
  activeIndex: number;
  onActiveIndexChange: (
    index: number
  ) => void;
  onSelect: (
    item: GlobalSearchItem
  ) => void;
  className?: string;
}

function SearchResults({
  id,
  query,
  results,
  recentIds,
  activeIndex,
  onActiveIndexChange,
  onSelect,
  className,
}: SearchResultsProps) {
  const hasQuery =
    query.trim().length > 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-800">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {!hasQuery &&
          recentIds.length > 0 ? (
            <FiClock aria-hidden="true" />
          ) : (
            <FiSearch aria-hidden="true" />
          )}

          {hasQuery
            ? "Resultados"
            : recentIds.length > 0
              ? "Recientes y accesos rápidos"
              : "Accesos rápidos"}
        </p>

        <span className="text-[11px] text-slate-400">
          {results.length}{" "}
          resultados
        </span>
      </div>

      <div
        id={id}
        role="listbox"
        className="max-h-96 overflow-y-auto p-2"
      >
        {results.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
              <FiSearch aria-hidden="true" />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Sin coincidencias
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Prueba con el nombre de una página, gráfica o sección.
            </p>
          </div>
        ) : (
          results.map(
            (item, index) => {
              const Icon =
                getCategoryIcon(
                  item.category
                );

              const isRecent =
                !hasQuery &&
                recentIds.includes(
                  item.id
                );

              const isActive =
                index ===
                activeIndex;

              return (
                <button
                  key={item.id}
                  id={`${id}-option-${item.id}`}
                  type="button"
                  role="option"
                  aria-selected={
                    isActive
                  }
                  onMouseEnter={() =>
                    onActiveIndexChange(
                      index
                    )
                  }
                  onClick={() =>
                    onSelect(item)
                  }
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-500/10"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      isActive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    <Icon aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {item.title}
                      </span>

                      {isRecent && (
                        <FiClock
                          className="shrink-0 text-slate-400"
                          aria-label="Búsqueda reciente"
                        />
                      )}
                    </span>

                    <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                      {
                        item.category
                      }{" "}
                      ·{" "}
                      {
                        item.description
                      }
                    </span>
                  </span>

                  <FiArrowUpRight
                    className={cn(
                      "mt-2.5 shrink-0",
                      isActive
                        ? "text-emerald-600"
                        : "text-slate-300 dark:text-slate-600"
                    )}
                    aria-hidden="true"
                  />
                </button>
              );
            }
          )
        )}
      </div>

      <div className="hidden items-center justify-between border-t border-slate-100 px-3 py-2 text-[11px] text-slate-400 dark:border-slate-800 sm:flex">
        <span>
          ↑↓ Navegar · Enter Abrir
        </span>

        <span>
          Esc Cerrar
        </span>
      </div>
    </div>
  );
}

function getCategoryIcon(
  category: GlobalSearchCategory
) {
  if (
    category === "Reportes"
  ) {
    return FiBarChart2;
  }

  if (
    category ===
    "Participación"
  ) {
    return FiActivity;
  }

  if (
    category ===
    "Administración"
  ) {
    return FiSettings;
  }

  return FiHome;
}

function normalizeSearchText(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLocaleLowerCase("es")
    .trim();
}

function getSearchScore(
  item: GlobalSearchItem,
  normalizedQuery: string
): number | null {
  const normalizedTitle =
    normalizeSearchText(
      item.title
    );

  const normalizedKeywords =
    normalizeSearchText(
      item.keywords.join(" ")
    );

  const normalizedDescription =
    normalizeSearchText(
      `${item.category} ${item.description}`
    );

  const searchableText =
    `${normalizedTitle} ${normalizedKeywords} ${normalizedDescription}`;

  const queryWords =
    normalizedQuery.split(/\s+/);

  if (
    !queryWords.every(
      (word) =>
        searchableText.includes(
          word
        )
    )
  ) {
    return null;
  }

  if (
    normalizedTitle ===
    normalizedQuery
  ) {
    return 0;
  }

  if (
    normalizedTitle.startsWith(
      normalizedQuery
    )
  ) {
    return 1;
  }

  if (
    normalizedTitle.includes(
      normalizedQuery
    )
  ) {
    return 2;
  }

  if (
    normalizedKeywords.includes(
      normalizedQuery
    )
  ) {
    return 3;
  }

  return 4;
}

function readRecentSearches(): string[] {
  try {
    const value =
      window.localStorage.getItem(
        RECENT_SEARCHES_KEY
      );

    if (!value) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter(
          (
            item
          ): item is string =>
            typeof item ===
            "string"
        )
      : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(
  ids: string[]
): void {
  try {
    window.localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(ids)
    );
  } catch {
    // El almacenamiento local es opcional.
  }
}