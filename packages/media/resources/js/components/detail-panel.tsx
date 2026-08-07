import { useState } from "react";
import { runAction } from "@lattice-php/action/lib/run-action";
import { apiFetch } from "@lattice-php/core/api";
import type { Node } from "@lattice-php/core/types";
import { useEffectDispatcher } from "@lattice-php/ui/effects/use-effect-dispatcher";
import { formatDateValue } from "@lattice-php/ui/format/temporal";
import { useFormatContext } from "@lattice-php/ui/format/format-context";
import { translate, useT } from "@lattice-php/ui/i18n";
import { Button } from "@lattice-php/ui/button";
import { ConfirmDialog } from "@lattice-php/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader } from "@lattice-php/ui/dialog";
import { PreviewableImage } from "@lattice-php/ui/image-preview";
import { Input } from "@lattice-php/ui/input";
import { Label } from "@lattice-php/ui/label";
import type { MediaRow } from "./library-view";

const byteUnits = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] as const;

function formatSize(bytes: number, locale: string): string {
  const exponent =
    bytes > 0 ? Math.min(Math.floor(Math.log10(bytes) / 3), byteUnits.length - 1) : 0;

  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: byteUnits[exponent],
    maximumFractionDigits: exponent === 0 ? 0 : 1,
  }).format(bytes / 1000 ** exponent);
}

/**
 * The slideout behind a card click: preview, metadata, and the two per-file
 * actions. Both requests carry `media_id`, so one runner covers them.
 */
export function DetailPanel({
  row,
  update,
  remove,
  onClose,
}: {
  row: MediaRow;
  update: Node<"action">;
  remove: Node<"action">;
  onClose: () => void;
}) {
  const { t } = useT("media");
  const { locale, timezone } = useFormatContext();
  const dispatch = useEffectDispatcher();
  const [name, setName] = useState(row.name);
  const [alt, setAlt] = useState(row.alt ?? "");
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const deleteLabel = t("media.actions.delete.label", "Delete");

  async function run(action: Node<"action">, payload: Record<string, unknown> = {}): Promise<void> {
    setProcessing(true);

    const ok = await runAction(
      () =>
        apiFetch(action.props.endpoint ?? "", {
          method: action.props.method ?? "post",
          ref: action.props.ref ?? "",
          body: JSON.stringify({ media_id: row.id, ...payload }),
          throwOnError: false,
        }),
      dispatch,
    );

    setProcessing(false);

    if (ok) {
      onClose();
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        className="flex flex-col gap-5"
        data-test="media-detail"
        placement="end"
        width="md"
      >
        <DialogHeader closeLabel={translate("lattice", "common.close", "Close")} title={row.name} />

        {row.url !== null && row.mime_type.startsWith("image/") ? (
          // The original, not the derivative: one src feeds both this image and
          // the lightbox it opens, and zooming into a cover-cropped thumbnail
          // shows less than the panel already did. A fixed box, not max-h, so
          // the metadata below does not shift as it loads.
          <PreviewableImage
            alt={row.alt ?? row.name}
            className="h-64 w-full rounded-lt-sm object-contain"
            previewable
            src={row.url}
            testId="media-detail-preview"
          />
        ) : (
          <p className="flex h-32 items-center justify-center rounded-lt-sm border border-lt-border text-sm text-lt-muted-fg">
            {row.mime_type}
          </p>
        )}

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-lt-muted-fg">{t("media.columns.type", "Type")}</dt>
          <dd className="text-lt-fg">{row.mime_type}</dd>
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

        <div className="flex items-center gap-3">
          <Button
            data-test="media-detail-save"
            disabled={processing || name.trim() === ""}
            onClick={() => void run(update, { name, alt: alt === "" ? null : alt })}
            type="button"
            variant="primary"
          >
            {t("media.detail.save", "Save")}
          </Button>
          {row.url !== null && (
            <a
              className="text-sm text-lt-primary underline underline-offset-2"
              href={row.url}
              rel="noreferrer"
              target="_blank"
            >
              {t("media.detail.download", "Download")}
            </a>
          )}
          <Button
            className="ms-auto"
            data-test="media-detail-delete"
            disabled={processing}
            onClick={() => setConfirming(true)}
            type="button"
            variant="danger"
          >
            {deleteLabel}
          </Button>
        </div>

        {confirming && (
          <ConfirmDialog
            cancelLabel={translate("lattice", "common.cancel", "Cancel")}
            confirmLabel={deleteLabel}
            confirmVariant="danger"
            description={t(
              "media.actions.delete.confirm-description",
              "This file is attached to {{count}} record(s). Deleting removes it everywhere.",
              { count: row.attachments_count },
            )}
            onCancel={() => setConfirming(false)}
            onConfirm={() => void run(remove)}
            processing={processing}
            title={t("media.actions.delete.confirm-title", "Delete this file?")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
