import { RenderNode } from "@lattice-php/lattice/core/renderer";
import { Icon } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { NotificationItem } from "../types";

const variantIconClass: Record<string, string> = {
  success: "text-lt-success",
  info: "text-lt-info",
  warning: "text-lt-warning",
  error: "text-lt-danger",
};

export function NotificationItemRow({
  notification,
  onMarkRead,
  onDismiss,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const { t } = useT("lattice");
  return (
    <li
      className={cn("flex gap-3 px-3 py-3", !notification.isRead && "bg-lt-muted/40")}
      data-test="notification"
    >
      {notification.icon ? (
        <Icon
          name={notification.icon}
          className={cn(
            "mt-0.5 size-lt-icon-md",
            notification.variant ? variantIconClass[notification.variant] : undefined,
          )}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        {notification.title ? (
          <p className="truncate text-sm font-medium text-lt-fg">{notification.title}</p>
        ) : null}
        {notification.body ? <p className="text-sm text-lt-muted-fg">{notification.body}</p> : null}
        {notification.actions.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {notification.actions.map((node, index) => (
              <RenderNode key={node.key ?? node.id ?? `action-${index}`} node={node} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        {!notification.isRead ? (
          <button
            type="button"
            className="text-xs text-lt-muted-fg hover:text-lt-fg"
            onClick={() => onMarkRead(notification.id)}
          >
            {t("notifications.mark-read", "Mark read")}
          </button>
        ) : null}
        <button
          type="button"
          aria-label={t("notifications.dismiss", "Dismiss")}
          className="text-xs text-lt-muted-fg hover:text-lt-fg"
          onClick={() => onDismiss(notification.id)}
        >
          {t("notifications.dismiss", "Dismiss")}
        </button>
      </div>
    </li>
  );
}
