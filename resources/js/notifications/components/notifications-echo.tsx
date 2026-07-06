import { useEchoNotification } from "@laravel/echo-react";
import type { NotificationItem } from "../types";

export function NotificationsEcho({
  channel,
  onReceive,
}: {
  channel: string;
  onReceive: (item: NotificationItem) => void;
}) {
  useEchoNotification<Partial<NotificationItem>>(channel, (payload) => {
    onReceive({
      id: payload.id,
      title: payload.title ?? null,
      body: payload.body ?? null,
      icon: payload.icon ?? null,
      variant: payload.variant ?? null,
      href: payload.href ?? null,
      openInNewTab: payload.openInNewTab ?? false,
      isRead: false,
      createdAt: null,
      actions: [],
    });
  });

  return null;
}
