import { Component, lazy, Suspense, type ReactNode } from "react";
import { Badge } from "@lattice-php/lattice/core/components/badge";
import { Dialog, DialogContent, DialogTitle } from "@lattice-php/lattice/core/components/dialog";
import {
  Popover as PopoverRoot,
  PopoverContent,
  PopoverTrigger,
} from "@lattice-php/lattice/core/components/popover";
import { Icon } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";
import type { RendererComponent } from "@lattice-php/lattice/core/types";
import { useNotifications } from "../store";
import type { NotificationItem } from "../types";
import { NotificationList } from "./notification-list";

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

  const label = t("notifications.label", "Notifications");

  const trigger = (
    <span className="relative inline-flex items-center justify-center rounded-lt-sm p-2 hover:bg-lt-muted">
      <Icon name="bell" className="size-lt-icon-md" />
      {store.unreadCount > 0 ? (
        <Badge
          variant="destructive"
          data-test="notifications-badge"
          className="absolute -right-0.5 -top-0.5 min-w-4 px-1 py-0 text-[10px]"
        >
          {store.unreadCount}
        </Badge>
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
        <>
          <button
            type="button"
            aria-label={label}
            data-test="notifications-trigger"
            onClick={() => store.setOpen(true)}
          >
            {trigger}
          </button>
          <Dialog open={store.open} onOpenChange={store.setOpen}>
            <DialogContent className="fixed left-auto right-0 top-0 h-full w-96 max-w-full translate-x-0 translate-y-0 overflow-y-auto p-0">
              <DialogTitle className="sr-only">{label}</DialogTitle>
              {panel}
            </DialogContent>
          </Dialog>
        </>
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
