import { Dialog, DialogContent, DialogTitle } from "@lattice-php/ui/primitives/dialog";
import { useT } from "@lattice-php/ui/i18n";
import { MODAL_MISSING_ERROR, useEmbeddedModal } from "@lattice-php/ui/components/modal/modal-host";
import { useLiveNotifications } from "../context";
import { NotificationList } from "./notification-list";

export function NotificationsSheet({ onClosed }: { onClosed: () => void }) {
  const context = useEmbeddedModal();

  if (!context) {
    throw new Error(MODAL_MISSING_ERROR);
  }

  const store = useLiveNotifications();
  const { t } = useT("lattice");
  const label = t("notifications.label", "Notifications");
  const heading = t("notifications.heading", "Notifications");

  return (
    <Dialog open={context.open} onOpenChange={context.onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="p-0"
        onCloseAutoFocus={(event) => {
          context.onExited(event);
          onClosed();
        }}
        placement="end"
        width="sm"
      >
        <DialogTitle className="sr-only">{label}</DialogTitle>
        <div className="w-full" data-test="notifications-panel">
          <div className="flex items-center justify-between border-b border-lt-border px-3 py-2">
            <span className="text-sm font-medium">{heading}</span>
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
      </DialogContent>
    </Dialog>
  );
}
