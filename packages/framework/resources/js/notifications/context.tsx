import { createContext, useContext, useSyncExternalStore } from "react";
import type { UseNotificationsReturn } from "./store";

export type NotificationsBridge = {
  publish: (next: UseNotificationsReturn) => void;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => UseNotificationsReturn;
};

export function createNotificationsBridge(initial: UseNotificationsReturn): NotificationsBridge {
  let snapshot = initial;
  const listeners = new Set<() => void>();

  return {
    publish(next) {
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
  };
}

const NotificationsContext = createContext<NotificationsBridge | null>(null);

export const NotificationsBridgeProvider = NotificationsContext.Provider;

/**
 * Returns the notifications store, kept live for a component mounted outside
 * the tree that owns the `useNotifications` call (the modal host renders
 * host-opened content as a sibling of the page, not a descendant) — the
 * bridge is a stable object the owner publishes fresh snapshots into, so
 * subscribers here re-render on every publish rather than reading whatever
 * props were frozen when the element was handed to `host.open()`.
 */
export function useLiveNotifications(): UseNotificationsReturn {
  const bridge = useContext(NotificationsContext);

  if (!bridge) {
    throw new Error("useLiveNotifications must be used within a NotificationsBridgeProvider.");
  }

  return useSyncExternalStore(bridge.subscribe, bridge.getSnapshot);
}
