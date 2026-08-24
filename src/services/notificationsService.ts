import {
  supabase,
} from "@/lib/supabase";

import type {
  AppNotification,
  NotificationKind,
} from "@/types/notification";

const notificationKinds:
  NotificationKind[] = [
    "academic_term",
    "account",
    "system",
    "warning",
  ];

export const notificationsService = {
  async getRecent(
    limit = 8
  ): Promise<AppNotification[]> {
    const { data, error } =
      await supabase.rpc(
        "get_recent_notifications",
        {
          limit_count: limit,
        }
      );

    if (error) {
      throw error;
    }

    return (data ?? []).map(
      (notification) => ({
        id: notification.id,

        kind: isNotificationKind(
          notification.notification_kind
        )
          ? notification.notification_kind
          : "system",

        title: notification.title,
        message: notification.message,
        link: notification.link,

        createdAt:
          notification.created_at,

        readAt:
          notification.read_at,
      })
    );
  },

  async getUnreadCount():
    Promise<number> {
    const { data, error } =
      await supabase.rpc(
        "get_unread_notification_count"
      );

    if (error) {
      throw error;
    }

    return data ?? 0;
  },

  async markAsRead(
    notificationId: string
  ): Promise<void> {
    const { error } =
      await supabase.rpc(
        "mark_notification_read",
        {
          target_notification_id:
            notificationId,
        }
      );

    if (error) {
      throw error;
    }
  },

  async markAllAsRead():
    Promise<void> {
    const { error } =
      await supabase.rpc(
        "mark_all_notifications_read"
      );

    if (error) {
      throw error;
    }
  },
};

function isNotificationKind(
  value: string
): value is NotificationKind {
  return notificationKinds.includes(
    value as NotificationKind
  );
}