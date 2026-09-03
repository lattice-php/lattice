import type { ReactNode } from "react";
import { Checkbox } from "@lattice-php/form/components/checkbox/checkbox";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { cn } from "@lattice-php/ui/lib/utils";
import { formatDateValue } from "@lattice-php/ui/format/temporal";
import { useFormatContext } from "@lattice-php/ui/format/format-context";
import { iconButtonVariants } from "@lattice-php/ui/primitives/icon-button";
import { CopyButton } from "@lattice-php/ui/primitives/copyable-text";
import { formatSize, typeLabel } from "./file-type";
import { MediaThumb } from "./media-preview";
import type { MediaRow } from "./media-row";

export type RowListProps = {
  activeId: number | null;
  isSelected: (row: MediaRow) => boolean;
  onActivate: (row: MediaRow, index: number, shiftKey: boolean) => void;
  onToggle: (row: MediaRow, index: number, shiftKey: boolean) => void;
  reloading: boolean;
  rows: MediaRow[];
};

/**
 * Download and copy sit beside the card's own button rather than inside it —
 * a button may not nest interactive content.
 */
export function RowQuickActions({ row }: { row: MediaRow }): ReactNode {
  const { t } = useT("media");

  if (row.url === null) {
    return null;
  }

  return (
    <>
      <a
        className={cn(iconButtonVariants(), "bg-lt-surface")}
        data-test="media-download"
        download={row.name}
        href={row.url}
        aria-label={t("media.detail.download", "Download")}
        rel="noreferrer"
        target="_blank"
      >
        <Icon aria-hidden="true" className="size-lt-icon-md" name="download" />
      </a>
      <CopyButton
        className="bg-lt-surface"
        iconOnly
        label={t("media.detail.url", "URL")}
        testId="media-copy-url"
        value={row.url}
      />
    </>
  );
}

export function MediaGrid({
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
        "grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5",
        reloading && "opacity-60",
      )}
      data-test="media-grid"
    >
      {rows.map((row, index) => (
        <li className="group relative" key={row.id}>
          <button
            aria-current={activeId === row.id}
            className={cn(
              "flex w-full flex-col overflow-hidden rounded-lt-sm border border-lt-border bg-lt-surface text-left",
              (isSelected(row) || activeId === row.id) &&
                "ring-[length:var(--lt-ring-width)] ring-lt-ring",
            )}
            data-test="media-card"
            onClick={(event) => onActivate(row, index, event.shiftKey)}
            type="button"
          >
            <MediaThumb className="aspect-square w-full" row={row} />
            <span className="flex flex-col gap-0.5 px-2 py-1.5">
              <span className="truncate text-sm text-lt-fg">{row.name}</span>
              <span className="truncate text-xs text-lt-muted-fg" data-test="media-card-meta">
                {[
                  typeLabel(row.name, row.mime_type).toUpperCase(),
                  formatSize(row.size, locale),
                  formatDateValue(
                    row.created_at,
                    { dateStyle: "medium", timeStyle: null },
                    { locale, timeZone: timezone },
                  ),
                ].join(" · ")}
              </span>
            </span>
          </button>
          <Checkbox
            aria-label={t("media.library.select", "Select {{name}}", { name: row.name })}
            checked={isSelected(row)}
            className="absolute left-2 top-2 bg-lt-surface"
            data-test="media-card-select"
            onClick={(event) => onToggle(row, index, event.shiftKey)}
          />
          <span className="absolute right-2 top-2 hidden gap-1 group-focus-within:flex group-hover:flex">
            <RowQuickActions row={row} />
          </span>
        </li>
      ))}
    </ul>
  );
}
