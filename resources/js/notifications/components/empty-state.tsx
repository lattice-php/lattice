import { Icon } from "@lattice-php/lattice/icons";
import { useT } from "@lattice-php/lattice/i18n";

export function EmptyState() {
  const { t } = useT("lattice");
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-lt-muted-fg">
      <Icon name="bell" className="size-lt-icon-lg" />
      <p className="text-sm">{t("notifications.empty", "No notifications yet")}</p>
    </div>
  );
}
