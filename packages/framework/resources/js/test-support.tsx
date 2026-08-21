import type { PagePayload } from "@lattice-php/lattice";
import type { NotificationItem } from "./notifications/types";

export function payload(lattice: Partial<PagePayload> = {}): PagePayload {
  return {
    breadcrumbs: [],
    listeners: [],
    schema: [],
    width: "full",
    layout: null,
    title: "Lattice",
    ...lattice,
  };
}

export function notificationItem(overrides: Partial<NotificationItem> = {}): NotificationItem {
  return {
    id: "notice-a",
    title: "Order shipped",
    body: "Tracking is available.",
    icon: "bell",
    variant: "info",
    href: null,
    isRead: false,
    createdAt: null,
    actions: [],
    ...overrides,
  };
}
