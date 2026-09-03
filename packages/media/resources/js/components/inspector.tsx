import { useState } from "react";
import { ActionConfirmOverlay } from "@lattice-php/action/components/action-confirm-overlay";
import { runAction } from "@lattice-php/action/lib/run-action";
import { apiFetch } from "@lattice-php/core/api";
import type { Node } from "@lattice-php/core/types";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { formatDateValue } from "@lattice-php/ui/format/temporal";
import { useFormatContext } from "@lattice-php/ui/format/format-context";
import { Icon } from "@lattice-php/ui/icons";
import { useT } from "@lattice-php/ui/i18n";
import { Button } from "@lattice-php/ui/components/button/button";
import { CopyButton } from "@lattice-php/ui/primitives/copyable-text";
import { IconButton } from "@lattice-php/ui/primitives/icon-button";
import { MODAL_MISSING_ERROR, useOptionalModal } from "@lattice-php/ui/components/modal/modal-host";
import { Input } from "@lattice-php/form/primitives/input";
import { Label } from "@lattice-php/form/primitives/label";
import { formatSize } from "./file-type";
import { MediaPreview } from "./media-preview";
import type { MediaRow } from "./media-row";

/**
 * The panel beside the grid: preview, metadata, and the two per-file actions.
 * Both requests carry `media_id`, so one runner covers them.
 */
export function Inspector({
  onClose,
  onDeleted,
  remove,
  row,
  update,
}: {
  onClose: () => void;
  onDeleted: () => void;
  remove: Node<"action">;
  row: MediaRow;
  update: Node<"action">;
}) {
  const { t } = useT("media");
  const { locale, timezone } = useFormatContext();
  const dispatch = useEffectDispatcher();
  const host = useOptionalModal();
  const [name, setName] = useState(row.name);
  const [alt, setAlt] = useState(row.alt ?? "");
  const [processing, setProcessing] = useState(false);
  const deleteLabel = t("media.actions.delete.label", "Delete");

  async function save(): Promise<void> {
    setProcessing(true);

    await runAction(
      () =>
        apiFetch(update.props.endpoint ?? "", {
          method: update.props.method ?? "post",
          ref: update.props.ref ?? "",
          body: JSON.stringify({ media_id: row.id, name, alt: alt === "" ? null : alt }),
          throwOnError: false,
        }),
      dispatch,
    );

    setProcessing(false);
  }

  function confirmDelete(): void {
    if (!host) {
      throw new Error(MODAL_MISSING_ERROR);
    }

    host.open(
      <ActionConfirmOverlay
        extraData={{ media_id: row.id }}
        node={{
          ...remove,
          props: {
            ...remove.props,
            confirmation: {
              title: t("media.actions.delete.confirm-title", "Delete this file?"),
              description: t(
                "media.actions.delete.confirm-description",
                "This file is attached to {{count}} record(s). Deleting removes it everywhere.",
                { count: row.attachments_count },
              ),
              confirmLabel: deleteLabel,
              cancelLabel: null,
            },
            variant: remove.props.variant ?? "danger",
          },
        }}
        onSuccess={onDeleted}
      />,
    );
  }

  return (
    <div className="flex flex-col gap-4" data-test="media-detail">
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 break-words text-sm font-medium text-lt-fg">{row.name}</p>
        <IconButton
          data-test="media-detail-close"
          icon="x"
          label={t("media.detail.close", "Close details")}
          onClick={onClose}
        />
      </div>

      <MediaPreview row={row} />

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-lt-muted-fg">{t("media.columns.type", "Type")}</dt>
        <dd className="truncate text-lt-fg">{row.mime_type}</dd>
        <dt className="text-lt-muted-fg">{t("media.columns.size", "Size")}</dt>
        <dd className="text-lt-fg">{formatSize(row.size, locale)}</dd>
        <dt className="text-lt-muted-fg">{t("media.columns.uploaded-at", "Uploaded")}</dt>
        <dd className="text-lt-fg">
          {formatDateValue(
            row.created_at,
            { dateStyle: "medium", timeStyle: "short" },
            { locale, timeZone: timezone },
          )}
        </dd>
        <dt className="text-lt-muted-fg">{t("media.columns.usage", "Used")}</dt>
        <dd className="text-lt-fg">{row.attachments_count}</dd>
      </dl>

      <Label className="grid gap-1.5">
        {t("media.columns.name", "Name")}
        <Input
          data-test="media-detail-name"
          maxLength={255}
          onChange={(event) => setName(event.target.value)}
          value={name}
        />
      </Label>

      <Label className="grid gap-1.5">
        {t("media.columns.alt", "Alt text")}
        <Input
          data-test="media-detail-alt"
          maxLength={255}
          onChange={(event) => setAlt(event.target.value)}
          value={alt}
        />
      </Label>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          data-test="media-detail-save"
          disabled={processing || name.trim() === ""}
          onClick={() => void save()}
          type="button"
          variant="primary"
        >
          {t("media.detail.save", "Save")}
        </Button>
        {row.url !== null && (
          <>
            <Button asChild emphasis="outline" size="sm">
              <a
                data-test="media-detail-download"
                download={row.name}
                href={row.url}
                rel="noreferrer"
                target="_blank"
              >
                <Icon aria-hidden="true" name="download" />
                {t("media.detail.download", "Download")}
              </a>
            </Button>
            <CopyButton
              label={t("media.detail.url", "URL")}
              testId="media-detail-copy-url"
              value={row.url}
            />
          </>
        )}
        <IconButton
          className="ms-auto text-lt-danger"
          data-test="media-detail-delete"
          disabled={processing}
          icon="trash-2"
          label={deleteLabel}
          onClick={confirmDelete}
        />
      </div>
    </div>
  );
}

/** What the panel shows while a multi-selection is active. */
export function SelectionSummary({ rows }: { rows: MediaRow[] }) {
  const { t } = useT("media");
  const { locale } = useFormatContext();
  const total = rows.reduce((bytes, row) => bytes + row.size, 0);

  return (
    <div className="flex flex-col gap-2 text-sm" data-test="media-selection-summary">
      <p className="font-medium text-lt-fg">
        {t("media.library.selected", "{{count}} selected", { count: rows.length })}
      </p>
      <p className="text-lt-muted-fg">{formatSize(total, locale)}</p>
    </div>
  );
}
