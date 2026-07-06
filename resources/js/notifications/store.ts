import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearAll as apiClearAll,
  dismiss as apiDismiss,
  fetchNotifications,
  markAllRead as apiMarkAllRead,
  markRead as apiMarkRead,
} from "./api";
import type { NotificationItem } from "./types";

export function prependIncoming(
  list: NotificationItem[],
  item: NotificationItem,
): NotificationItem[] {
  if (list.some((n) => n.id === item.id)) {
    return list;
  }

  return [item, ...list];
}

export function markReadIn(list: NotificationItem[], id: string): NotificationItem[] {
  return list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
}

export function removeIn(list: NotificationItem[], id: string): NotificationItem[] {
  return list.filter((n) => n.id !== id);
}

export type NotificationsStatus = "loading" | "idle" | "error";

export type UseNotificationsOptions = {
  endpoint: string;
  pollingInterval?: number | null;
};

export type UseNotificationsReturn = {
  notifications: NotificationItem[];
  unreadCount: number;
  status: NotificationsStatus;
  hasMore: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  loadMore: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  receive: (item: NotificationItem) => void;
};

export function useNotifications({
  endpoint,
  pollingInterval,
}: UseNotificationsOptions): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState<NotificationsStatus>("loading");
  const [hasMore, setHasMore] = useState(false);
  const [open, setOpen] = useState(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(hasMore);
  hasMoreRef.current = hasMore;
  const loadingMoreRef = useRef(false);

  const hydrate = useCallback(async (): Promise<void> => {
    try {
      const result = await fetchNotifications(endpoint, 1);
      pageRef.current = 1;
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      setHasMore(result.hasMore);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, [endpoint]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!pollingInterval || pollingInterval <= 0) {
      return;
    }

    const timer = setInterval(() => void hydrate(), pollingInterval * 1000);

    return () => clearInterval(timer);
  }, [hydrate, pollingInterval]);

  const loadMore = useCallback((): void => {
    if (loadingMoreRef.current || !hasMoreRef.current) {
      return;
    }

    loadingMoreRef.current = true;
    const next = pageRef.current + 1;
    void fetchNotifications(endpoint, next)
      .then((result) => {
        pageRef.current = next;
        setNotifications((current) => [...current, ...result.notifications]);
        setHasMore(result.hasMore);
      })
      .catch(() => void hydrate())
      .finally(() => {
        loadingMoreRef.current = false;
      });
  }, [endpoint, hydrate]);

  const markRead = useCallback(
    (id: string): void => {
      setNotifications((current) => markReadIn(current, id));
      setUnreadCount((count) => Math.max(0, count - 1));
      void apiMarkRead(endpoint, id)
        .then((r) => setUnreadCount(r.unreadCount))
        .catch(() => void hydrate());
    },
    [endpoint, hydrate],
  );

  const markAllRead = useCallback((): void => {
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    void apiMarkAllRead(endpoint)
      .then((r) => setUnreadCount(r.unreadCount))
      .catch(() => void hydrate());
  }, [endpoint, hydrate]);

  const dismiss = useCallback(
    (id: string): void => {
      setNotifications((current) => removeIn(current, id));
      void apiDismiss(endpoint, id)
        .then((r) => setUnreadCount(r.unreadCount))
        .catch(() => void hydrate());
    },
    [endpoint, hydrate],
  );

  const clearAll = useCallback((): void => {
    setNotifications([]);
    setUnreadCount(0);
    void apiClearAll(endpoint)
      .then((r) => setUnreadCount(r.unreadCount))
      .catch(() => void hydrate());
  }, [endpoint, hydrate]);

  const receive = useCallback((item: NotificationItem): void => {
    setNotifications((current) => {
      const next = prependIncoming(current, item);
      if (next !== current) {
        setUnreadCount((count) => count + 1);
      }
      return next;
    });
  }, []);

  return {
    notifications,
    unreadCount,
    status,
    hasMore,
    open,
    setOpen,
    loadMore,
    markRead,
    markAllRead,
    dismiss,
    clearAll,
    receive,
  };
}
