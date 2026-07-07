import type { NotificationItem } from "@lattice-php/lattice/types/generated";

export type { NotificationItem };

export type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
  hasMore: boolean;
};

export type UnreadCountResponse = { unreadCount: number };
