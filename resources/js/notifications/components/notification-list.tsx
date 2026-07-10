import { Skeleton } from "@lattice-php/lattice/ui/skeleton";
import { useT } from "@lattice-php/lattice/i18n";
import type { NotificationItem } from "@lattice-php/lattice/notifications/types";
import type { NotificationsStatus } from "@lattice-php/lattice/notifications/store";
import { EmptyState } from "./empty-state";
import { NotificationItemRow } from "./notification-item";

export function NotificationList({
  notifications,
  status,
  hasMore,
  onMarkRead,
  onDismiss,
  onLoadMore,
}: {
  notifications: NotificationItem[];
  status: NotificationsStatus;
  hasMore: boolean;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onLoadMore: () => void;
}) {
  const { t } = useT("lattice");

  if (status === "loading" && notifications.length === 0) {
    return (
      <div className="space-y-2 p-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <ul className="divide-y divide-lt-border">
        {notifications.map((notification) => (
          <NotificationItemRow
            key={notification.id}
            notification={notification}
            onMarkRead={onMarkRead}
            onDismiss={onDismiss}
          />
        ))}
      </ul>
      {hasMore ? (
        <button
          type="button"
          className="w-full py-2 text-sm text-lt-muted-fg hover:text-lt-fg"
          onClick={onLoadMore}
        >
          {t("notifications.load-more", "Load more")}
        </button>
      ) : null}
    </div>
  );
}
