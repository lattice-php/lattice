import { Link } from "@inertiajs/react";
import { RenderNode } from "@lattice-php/lattice/core/renderer";
import { IconRenderer } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";
import { resolveText } from "@lattice-php/lattice/i18n/translatable";
import { cn } from "@lattice-php/lattice/lib/utils";
import type { NotificationItem } from "@lattice-php/lattice/notifications/types";

const variantIconClass: Record<NonNullable<NotificationItem["variant"]>, string> = {
  success: "text-lt-success",
  info: "text-lt-info",
  warning: "text-lt-warning",
  danger: "text-lt-danger",
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

  const title = resolveText(notification.title, t);
  const body = resolveText(notification.body, t);

  const content = (
    <>
      {title ? <p className="truncate text-sm font-medium text-lt-fg">{title}</p> : null}
      {body ? <p className="text-sm text-lt-muted-fg">{body}</p> : null}
    </>
  );

  return (
    <li
      className={cn("flex gap-3 px-3 py-3", !notification.isRead && "bg-lt-muted/40")}
      data-test="notification"
    >
      {notification.icon ? (
        <IconRenderer
          icon={notification.icon}
          className={cn(
            "mt-0.5 size-lt-icon-md",
            notification.variant ? variantIconClass[notification.variant] : undefined,
          )}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        {notification.href ? (
          <Link
            href={notification.href}
            className="block"
            data-test="notification-link"
            onClick={() => onMarkRead(notification.id)}
          >
            {content}
          </Link>
        ) : (
          content
        )}
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
