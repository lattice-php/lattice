import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Popover as PopoverRoot,
  PopoverContent,
  PopoverTrigger,
} from "@lattice-php/ui/primitives/popover";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { type ModalHandle, useModal } from "@lattice-php/ui/modal";
import type { RendererComponent } from "@lattice-php/core/types";
import { useNotifications } from "@lattice-php/lattice/notifications/store";
import type { NotificationItem } from "@lattice-php/lattice/notifications/types";
import { createNotificationsBridge, NotificationsBridgeProvider } from "../context";
import { NotificationList } from "./notification-list";
import { NotificationsSheet } from "./notifications-sheet";

const NotificationsEcho = lazy(() =>
  import("./notifications-echo").then((m) => ({ default: m.NotificationsEcho })),
);

class EchoBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(): void {
    console.warn(
      "[lattice] The notifications bell declares a realtime channel but Echo is unavailable. Install @laravel/echo-react and call configureEcho().",
    );
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

const NotificationsComponent: RendererComponent<"notifications"> = ({ node }) => {
  const { t } = useT("lattice");
  const store = useNotifications({
    endpoint: node.props.endpoint,
    pollingInterval: node.props.pollingInterval,
  });
  const host = useModal();
  const handleRef = useRef<ModalHandle | null>(null);
  const [bridge] = useState(() => createNotificationsBridge(store));

  useEffect(() => {
    bridge.publish(store);
  }, [bridge, store]);

  const label = t("notifications.label", "Notifications");

  const openSheet = useCallback((): void => {
    if (handleRef.current) {
      return;
    }

    handleRef.current = host.open(
      <NotificationsBridgeProvider value={bridge}>
        <NotificationsSheet
          onClosed={() => {
            handleRef.current = null;
          }}
        />
      </NotificationsBridgeProvider>,
    );
  }, [bridge, host]);

  const trigger = (
    <span className="relative inline-flex items-center justify-center rounded-lt-sm p-2 hover:bg-lt-muted">
      <Icon name="bell" className="size-lt-icon-md" />
      {store.unreadCount > 0 ? (
        <span
          data-test="notifications-badge"
          className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-lt-full bg-lt-danger px-1 py-0 text-[10px] font-medium text-lt-danger-fg"
        >
          {store.unreadCount}
        </span>
      ) : null}
    </span>
  );

  const panel = (
    <div className="w-80" data-test="notifications-panel">
      <div className="flex items-center justify-between border-b border-lt-border px-3 py-2">
        <span className="text-sm font-medium">{t("notifications.heading", "Notifications")}</span>
        {store.unreadCount > 0 ? (
          <button
            type="button"
            className="text-xs text-lt-muted-fg hover:text-lt-fg"
            onClick={store.markAllRead}
          >
            {t("notifications.mark-all-read", "Mark all read")}
          </button>
        ) : null}
      </div>
      <NotificationList
        notifications={store.notifications}
        status={store.status}
        hasMore={store.hasMore}
        onMarkRead={store.markRead}
        onDismiss={store.dismiss}
        onLoadMore={store.loadMore}
      />
    </div>
  );

  return (
    <>
      {node.props.channel ? (
        <EchoBoundary>
          <Suspense fallback={null}>
            <NotificationsEcho
              channel={node.props.channel}
              onReceive={(item: NotificationItem) => store.receive(item)}
            />
          </Suspense>
        </EchoBoundary>
      ) : null}

      {node.props.slideOut ? (
        <button
          type="button"
          aria-label={label}
          data-test="notifications-trigger"
          onClick={openSheet}
        >
          {trigger}
        </button>
      ) : (
        <PopoverRoot open={store.open} onOpenChange={store.setOpen}>
          <PopoverTrigger asChild>
            <button type="button" aria-label={label} data-test="notifications-trigger">
              {trigger}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="p-0">
            {panel}
          </PopoverContent>
        </PopoverRoot>
      )}
    </>
  );
};

export default NotificationsComponent;
