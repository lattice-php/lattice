import type { Node } from "@lattice-php/lattice/core/types";
import type { NotificationItem as GeneratedNotificationItem } from "@lattice-php/lattice/types/generated";

/**
 * The generated payload shape, but `actions` is widened from the generated node
 * union to open `Node`s so a row can also carry a consumer's custom action node.
 */
export type NotificationItem = Omit<GeneratedNotificationItem, "actions"> & {
  actions: Node[];
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
  hasMore: boolean;
};

export type UnreadCountResponse = { unreadCount: number };
