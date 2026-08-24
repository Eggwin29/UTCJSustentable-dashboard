import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  IconType,
} from "react-icons";

import {
  FiAlertTriangle,
  FiBell,
  FiCalendar,
  FiCheck,
  FiInbox,
  FiRefreshCw,
  FiSettings,
  FiUserCheck,
  FiX,
} from "react-icons/fi";

import {
  formatDistanceToNow,
} from "date-fns";

import {
  es,
} from "date-fns/locale";

import {
  useNavigate,
} from "react-router-dom";

import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/button";

import {
  useClickOutside,
} from "@/hooks/useClickOutside";

import {
  notificationsService,
} from "@/services/notificationsService";

import type {
  AppNotification,
  NotificationKind,
} from "@/types/notification";

import {
  cn,
} from "@/utils/cn";

const REFRESH_INTERVAL_MS = 60_000;

interface NotificationStyle {
  icon: IconType;
  iconClassName: string;
}

const notificationStyles: Record<
  NotificationKind,
  NotificationStyle
> = {
  academic_term: {
    icon: FiCalendar,

    iconClassName:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },

  account: {
    icon: FiUserCheck,

    iconClassName:
      "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  },

  system: {
    icon: FiSettings,

    iconClassName:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },

  warning: {
    icon: FiAlertTriangle,

    iconClassName:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
};

export default function NotificationsMenu() {
  const navigate = useNavigate();

  const containerRef =
    useRef<HTMLDivElement>(null);

  const [open, setOpen] =
    useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<AppNotification[]>([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [markingAll, setMarkingAll] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadNotifications =
    useCallback(
      async (
        mode:
          | "initial"
          | "refresh" = "refresh"
      ) => {
        try {
          if (mode === "initial") {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setErrorMessage("");

          const [
            recent,
            unread,
          ] = await Promise.all([
            notificationsService.getRecent(),

            notificationsService.getUnreadCount(),
          ]);

          setNotifications(recent);
          setUnreadCount(unread);
        } catch (error) {
          console.error(
            "Error al cargar notificaciones:",
            error
          );

          setErrorMessage(
            "No se pudieron cargar las notificaciones."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    const initialFrame =
      window.requestAnimationFrame(
        () => {
          void loadNotifications(
            "initial"
          );
        }
      );

    const intervalId =
      window.setInterval(() => {
        void loadNotifications();
      }, REFRESH_INTERVAL_MS);

    const handleWindowFocus =
      () => {
        void loadNotifications();
      };

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      window.cancelAnimationFrame(
        initialFrame
      );

      window.clearInterval(
        intervalId
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  useClickOutside(
    containerRef,
    () => setOpen(false),
    open
  );

  const handleToggle = () => {
    setOpen((current) => {
      const nextOpen = !current;

      if (nextOpen) {
        void loadNotifications();
      }

      return nextOpen;
    });
  };

  const handleNotificationClick =
    async (
      notification: AppNotification
    ) => {
      if (!notification.readAt) {
        const readAt =
          new Date().toISOString();

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  readAt,
                }
              : item
          )
        );

        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );

        try {
          await notificationsService.markAsRead(
            notification.id
          );
        } catch (error) {
          console.error(
            "Error al marcar la notificación:",
            error
          );

          void loadNotifications();
        }
      }

      setOpen(false);

      if (notification.link) {
        navigate(notification.link);
      }
    };

  const handleMarkAllAsRead =
    async () => {
      if (
        unreadCount === 0 ||
        markingAll
      ) {
        return;
      }

      try {
        setMarkingAll(true);

        await notificationsService.markAllAsRead();

        const readAt =
          new Date().toISOString();

        setNotifications((current) =>
          current.map(
            (notification) => ({
              ...notification,

              readAt:
                notification.readAt ??
                readAt,
            })
          )
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Error al marcar todas las notificaciones:",
          error
        );

        setErrorMessage(
          "No se pudieron actualizar las notificaciones."
        );
      } finally {
        setMarkingAll(false);
      }
    };

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={
          unreadCount > 0
            ? `Notificaciones: ${unreadCount} sin leer`
            : "Notificaciones"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "relative rounded-xl p-2.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30",

          open
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
        )}
      >
        <FiBell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notificaciones recientes"
          className="fixed left-3 right-3 top-24 z-50 max-h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[400px]"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Notificaciones
                </h2>

                {unreadCount > 0 && (
                  <Badge variant="primary">
                    {unreadCount} sin leer
                  </Badge>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Cambios importantes del
                sistema y de tu cuenta.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Cerrar notificaciones"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950/30">
            <button
              type="button"
              onClick={() =>
                void loadNotifications()
              }
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-white hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
            >
              <FiRefreshCw
                className={cn(
                  refreshing &&
                    "animate-spin"
                )}
                aria-hidden="true"
              />

              Actualizar
            </button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              leftIcon={
                <FiCheck
                  aria-hidden="true"
                />
              }
              loading={markingAll}
              disabled={
                unreadCount === 0
              }
              onClick={() =>
                void handleMarkAllAsRead()
              }
            >
              Marcar todas como leídas
            </Button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && (
              <NotificationsSkeleton />
            )}

            {!loading &&
              errorMessage && (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    <FiAlertTriangle
                      aria-hidden="true"
                    />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    No pudimos cargar las
                    notificaciones
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Inténtalo nuevamente en
                    unos segundos.
                  </p>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      void loadNotifications(
                        "initial"
                      )
                    }
                  >
                    Reintentar
                  </Button>
                </div>
              )}

            {!loading &&
              !errorMessage &&
              notifications.length ===
                0 && (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <FiInbox
                      aria-hidden="true"
                    />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Todo está al día
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Aquí aparecerán solamente
                    los cambios importantes.
                  </p>
                </div>
              )}

            {!loading &&
              !errorMessage &&
              notifications.map(
                (notification) => (
                  <NotificationItem
                    key={
                      notification.id
                    }
                    notification={
                      notification
                    }
                    onClick={() =>
                      void handleNotificationClick(
                        notification
                      )
                    }
                  />
                )
              )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/30">
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
              Se actualizan automáticamente
              cada minuto.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: AppNotification;
  onClick: () => void;
}

function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const style =
    notificationStyles[
      notification.kind
    ];

  const Icon = style.icon;

  const isUnread =
    !notification.readAt;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70",

        isUnread &&
          "bg-emerald-50/40 dark:bg-emerald-950/10"
      )}
    >
      {isUnread && (
        <span
          aria-label="Sin leer"
          className="absolute right-4 top-4 h-2 w-2 rounded-full bg-emerald-500"
        />
      )}

      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
          style.iconClassName
        )}
      >
        <Icon aria-hidden="true" />
      </span>

      <span className="min-w-0 pr-4">
        <span
          className={cn(
            "block text-sm text-slate-800 dark:text-slate-100",

            isUnread
              ? "font-bold"
              : "font-semibold"
          )}
        >
          {notification.title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
          {notification.message}
        </span>

        <span className="mt-2 block text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {formatNotificationDate(
            notification.createdAt
          )}
        </span>
      </span>
    </button>
  );
}

function NotificationsSkeleton() {
  return (
    <div
      className="divide-y divide-slate-100 dark:divide-slate-800"
      aria-label="Cargando notificaciones"
    >
      {Array.from({
        length: 3,
      }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse gap-3 px-5 py-4"
        >
          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700" />

          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />

            <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />

            <div className="h-2.5 w-20 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatNotificationDate(
  date: string
): string {
  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "Fecha no disponible";
  }

  return formatDistanceToNow(
    parsedDate,
    {
      addSuffix: true,
      locale: es,
    }
  );
}