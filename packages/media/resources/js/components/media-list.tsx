import { Checkbox } from "@lattice-php/form/components/checkbox/checkbox";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { formatDateValue } from "@lattice-php/ui/format/temporal";
import { useFormatContext } from "@lattice-php/ui/format/format-context";
import { formatSize, typeLabel } from "./file-type";
import { RowQuickActions } from "./media-grid";
import type { RowListProps } from "./media-grid";
import { MediaThumb } from "./media-preview";

export function MediaList({
  activeId,
  isSelected,
  onActivate,
  onToggle,
  reloading,
  rows,
}: RowListProps) {
  const { t } = useT("media");
  const { locale, timezone } = useFormatContext();

  return (
    <ul
      aria-busy={reloading}
      className={cn(
        "divide-y divide-lt-border rounded-lt-sm border border-lt-border transition-opacity",
        reloading && "opacity-60",
      )}
      data-test="media-list"
    >
      {rows.map((row, index) => (
        <li
          className={cn(
            "group flex items-center gap-3 bg-lt-surface px-3 py-2",
            activeId === row.id && "bg-lt-accent",
          )}
          key={row.id}
        >
          <Checkbox
            aria-label={t("media.library.select", "Select {{name}}", { name: row.name })}
            checked={isSelected(row)}
            data-test="media-card-select"
            onClick={(event) => onToggle(row, index, event.shiftKey)}
          />
          <button
            aria-current={activeId === row.id}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
            data-test="media-card"
            onClick={(event) => onActivate(row, index, event.shiftKey)}
            type="button"
          >
            <MediaThumb className="size-10 shrink-0 rounded-lt-xs" row={row} />
            <span className="min-w-0 flex-1 truncate text-sm text-lt-fg">{row.name}</span>
            <span className="hidden w-20 shrink-0 text-xs uppercase text-lt-muted-fg sm:block">
              {typeLabel(row.name, row.mime_type)}
            </span>
            <span className="hidden w-24 shrink-0 text-end text-xs text-lt-muted-fg sm:block">
              {formatSize(row.size, locale)}
            </span>
            <span className="hidden w-28 shrink-0 text-end text-xs text-lt-muted-fg md:block">
              {formatDateValue(
                row.created_at,
                { dateStyle: "medium", timeStyle: null },
                { locale, timeZone: timezone },
              )}
            </span>
          </button>
          <span className="flex shrink-0 gap-1">
            <RowQuickActions row={row} />
          </span>
        </li>
      ))}
    </ul>
  );
}
