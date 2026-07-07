import type { Node } from "@lattice-php/lattice/core/types";

export type NotificationItem = {
  id: string;
  title: string | null;
  body: string | null;
  icon: string | null;
  variant: "success" | "info" | "warning" | "error" | null;
  href: string | null;
  isRead: boolean;
  createdAt: string | null;
  actions: Node[];
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
  hasMore: boolean;
};

export type UnreadCountResponse = { unreadCount: number };
