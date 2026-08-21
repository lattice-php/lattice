import type { ComponentProps, ReactNode, RefObject } from "react";
import { IconButton } from "@lattice-php/ui/primitives/icon-button";
import { useT } from "@lattice-php/ui/i18n";

export type FileUploadItem = {
  id: string;
  itemTestId?: string;
  name: string;
  previewTestId?: string;
  progress: number;
  removable: boolean;
  removeTestId?: string;
  status: "error" | "ready" | "uploading";
  url?: string | null;
};

export type FileUploadProps = {
  disabled?: boolean;
  hiddenInputs?: ReactNode;
  image?: boolean;
  inputProps: ComponentProps<"input"> & {
    [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
  };
  inputRef: RefObject<HTMLInputElement | null>;
  items: FileUploadItem[];
  onFilesAdded: (files: FileList | null) => void;
  onRemove: (id: string) => void;
  resetOnSelect?: boolean;
  testId?: string;
};

export function FileUpload({
  disabled = false,
  hiddenInputs,
  image = false,
  inputProps,
  inputRef,
  items,
  onFilesAdded,
  onRemove,
  resetOnSelect = false,
  testId,
}: FileUploadProps) {
  const { t } = useT("lattice");

  return (
    <div
      className="flex flex-col gap-3 rounded-lt-sm border border-dashed border-lt-border bg-lt-surface px-4 py-6"
      data-test={testId}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFilesAdded(event.dataTransfer.files);
      }}
    >
      <button
        className="text-sm text-lt-muted-fg"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {t("form.file-upload.dropzone", "Drop files here or click to browse")}
      </button>

      <ul className={image ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "flex flex-col gap-2"}>
        {items.map((item) => (
          <li
            className={
              image
                ? "flex min-w-0 items-center gap-3 rounded-lt-sm border border-lt-border bg-lt-bg p-2 text-sm"
                : "flex items-center justify-between gap-3 text-sm"
            }
            key={item.id}
          >
            {image && item.url ? (
              <img
                alt={item.name}
                className="size-16 shrink-0 rounded-lt-sm border border-lt-border object-cover"
                data-test={item.previewTestId}
                src={item.url}
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <span className="block truncate" data-test={item.itemTestId}>
                {item.name}
              </span>
              {item.status === "uploading" && (
                <span className="text-xs text-lt-muted-fg">{item.progress}%</span>
              )}
              {item.status === "error" && (
                <span className="text-xs text-lt-danger">
                  {t("form.file-upload.failed", "Failed")}
                </span>
              )}
            </div>
            {item.removable && (
              <IconButton
                size="sm"
                icon="x"
                label={t("form.file-upload.remove", "Remove {{name}}", { name: item.name })}
                data-test={item.removeTestId}
                disabled={disabled}
                onClick={() => onRemove(item.id)}
              />
            )}
          </li>
        ))}
      </ul>

      {hiddenInputs}

      <input
        {...inputProps}
        className="sr-only"
        onChange={(event) => {
          onFilesAdded(event.target.files);
          if (resetOnSelect) {
            event.target.value = "";
          }
        }}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}
