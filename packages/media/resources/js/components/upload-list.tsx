import { IconButton } from "@lattice-php/ui/primitives/icon-button";
import { useT } from "@lattice-php/ui/i18n";
import type { UploadItem } from "./use-media-upload";

export function UploadList({
  uploads,
  retry,
  dismiss,
}: {
  uploads: UploadItem[];
  retry: (item: UploadItem) => void;
  dismiss: (id: string) => void;
}) {
  const { t } = useT("media");

  if (uploads.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {uploads.map((item) => (
        <li
          className="flex max-w-64 items-center gap-2 rounded-lt-sm border border-lt-border bg-lt-surface px-2 py-1 text-sm"
          key={item.id}
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-lt-fg">{item.name}</span>
            {item.status === "error" && (
              <span
                className="block truncate text-xs text-lt-danger"
                data-test="media-upload-reason"
              >
                {item.reason ?? t("media.library.upload-failed", "Upload failed")}
              </span>
            )}
          </span>
          {item.status === "error" ? (
            <>
              <IconButton
                data-test="media-upload-retry"
                icon="rotate-ccw"
                label={t("media.library.upload-retry", "Retry {{name}}", { name: item.name })}
                onClick={() => retry(item)}
              />
              <IconButton
                data-test="media-upload-dismiss"
                icon="x"
                label={t("media.library.upload-dismiss", "Dismiss {{name}}", {
                  name: item.name,
                })}
                onClick={() => dismiss(item.id)}
              />
            </>
          ) : (
            <span className="text-lt-muted-fg">{`${item.progress}%`}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
