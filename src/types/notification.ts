export type NotificationKind =
  | "academic_term"
  | "account"
  | "system"
  | "warning";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
  readAt: string | null;
}