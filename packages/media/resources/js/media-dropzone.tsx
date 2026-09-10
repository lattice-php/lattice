import { useRef, useState } from "react";
import { RenderNode } from "@lattice-php/core/renderer";
import type { Node, RendererComponent } from "@lattice-php/core/types";
import { SimpleField } from "@lattice-php/form/components/base/simple-field";
import { useT } from "@lattice-php/ui/i18n";
import { Icon } from "@lattice-php/ui/icons";
import { cn } from "@lattice-php/ui/lib/utils";
import {
  MODAL_MISSING_ERROR,
  useEmbeddedModal,
  useModal,
} from "@lattice-php/ui/components/modal/modal-host";
import { ConfirmDialog } from "@lattice-php/ui/primitives/confirm-dialog";
import { PreviewableImage } from "@lattice-php/ui/primitives/image-preview";
import { documentNode, isViewableDocument, MediaThumb } from "./components/media-preview";
import type { MediaDescriptor } from "./components/media-row";
import { UploadList } from "./components/upload-list";
import { useMediaUpload } from "./components/use-media-upload";
import { DropzoneProvider } from "./dropzone-context";
import { DropzoneRemoveButton } from "./dropzone-remove";

function ReplaceConfirm({ name, onConfirm }: { name: string; onConfirm: () => void }) {
  const { t } = useT("media");
  const context = useEmbeddedModal();

  if (!context) {
    throw new Error(MODAL_MISSING_ERROR);
  }

  return (
    <ConfirmDialog
      cancelLabel={t("media.dropzone.replace-cancel", "Keep file")}
      confirmLabel={t("media.dropzone.replace-confirm", "Replace")}
      description={t(
        "media.dropzone.replace-description",
        "{{name}} is replaced by the dropped file.",
        { name },
      )}
      onCancel={() => context.onOpenChange(false)}
      onConfirm={() => {
        context.onOpenChange(false);
        onConfirm();
      }}
      onExited={context.onExited}
      open={context.open}
      title={t("media.dropzone.replace-title", "Replace this file?")}
    />
  );
}

/**
 * Single-file, upload-only picker whose whole face is the file. The library
 * node it embeds only contributes the upload action and the accept list; a
 * pdf viewer template (when composed) previews documents and carries the
 * remove control in its toolbar.
 */
const MediaDropzoneComponent: RendererComponent<"field.media-dropzone"> = ({ node }) => {
  const { t } = useT("media");
  const props = node.props;
  const host = useModal();
  const libraryNode = node.schema?.find((child) => child.type === "media.library") as
    | Node<"media.library">
    | undefined;
  const uploadNode = libraryNode?.schema?.find((child) => child.key === "media-upload") as
    | Node<"action">
    | undefined;
  const viewer = node.schema?.find((child) => child.key === "media-dropzone-pdf");
  const [picked, setPicked] = useState<MediaDescriptor | null>(props.selected?.[0] ?? null);
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const commitRef = useRef<(value: unknown) => void>(() => {});
  const { uploads, addFiles, retry, dismiss } = useMediaUpload({
    endpoint: uploadNode?.props.endpoint ?? "",
    ref: uploadNode?.props.ref ?? "",
    signed: libraryNode?.props.signed ?? false,
    onUploaded: (media) => {
      const stored = media[0];

      if (stored) {
        setPicked(stored);
        commitRef.current(stored.id);
      }
    },
  });
  const busy = uploads.some((item) => item.status === "uploading");

  return (
    <SimpleField label={props.label ?? ""} node={node}>
      {({ name, commit, disabled, readOnly }) => {
        commitRef.current = commit;
        const locked = disabled || readOnly;

        // The pdf viewer draws its own frame; a second one around it would read
        // as a double border, so the face is only framed when it holds the
        // preview itself.
        const document_ =
          picked !== null && isViewableDocument(picked, viewer) && viewer !== undefined
            ? documentNode(viewer, picked, { height: "100%" })
            : null;

        const remove = (): void => {
          setPicked(null);
          commit("");
        };

        const receive = (files: FileList | File[] | null): void => {
          const file = files ? Array.from(files)[0] : undefined;

          if (locked || busy || !file) {
            return;
          }

          if (picked) {
            host.open(<ReplaceConfirm name={picked.name} onConfirm={() => addFiles([file])} />);

            return;
          }

          addFiles([file]);
        };

        return (
          <div className="flex min-w-0 flex-col gap-2" data-test={`media-dropzone-${name}`}>
            <input name={name} type="hidden" value={picked?.id ?? ""} />
            <input
              accept={libraryNode?.props.accept ?? undefined}
              aria-label={uploadNode?.props.label ?? t("media.actions.upload.label", "Upload")}
              className="sr-only"
              data-test="media-dropzone-input"
              onChange={(event) => {
                receive(event.target.files);
                event.target.value = "";
              }}
              ref={fileInput}
              type="file"
            />
            <div
              className={cn(
                "relative flex min-w-0 flex-col overflow-hidden rounded-lt bg-lt-surface",
                document_ === null && [
                  "border",
                  picked === null && "border-dashed",
                  dragActive ? "border-lt-primary" : "border-lt-border",
                ],
                document_ !== null && dragActive && "ring-2 ring-lt-primary",
              )}
              data-drag-active={dragActive || undefined}
              data-test="media-dropzone-face"
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as HTMLElement | null)) {
                  setDragActive(false);
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();

                if (!locked && !busy) {
                  setDragActive(true);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                receive(event.dataTransfer.files);
              }}
              style={{ height: props.height }}
            >
              {picked === null ? (
                <button
                  className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-lt-muted-fg enabled:hover:text-lt-fg disabled:cursor-not-allowed"
                  data-test="media-dropzone-target"
                  disabled={locked || busy}
                  onClick={() => fileInput.current?.click()}
                  type="button"
                >
                  <Icon className="size-lt-icon-lg" name="file" />
                  <span>
                    {props.emptyText ??
                      t("media.dropzone.empty", "Drop a file here or click to upload.")}
                  </span>
                </button>
              ) : (
                <DropzoneProvider value={{ disabled: locked || busy, remove }}>
                  {document_ ? (
                    <RenderNode node={document_} />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 border-b border-lt-border px-2 py-1 text-sm">
                        <span className="min-w-0 flex-1 truncate text-lt-fg">{picked.name}</span>
                        <DropzoneRemoveButton />
                      </div>
                      {picked.mime_type.startsWith("image/") && picked.url !== null ? (
                        <PreviewableImage
                          alt={picked.alt ?? picked.name}
                          className="min-h-0 w-full flex-1 object-contain"
                          previewable
                          src={picked.url}
                          testId="media-dropzone-image"
                        />
                      ) : (
                        <MediaThumb
                          className="min-h-0 w-full flex-1"
                          row={picked}
                          testId="media-dropzone-file"
                        />
                      )}
                    </>
                  )}
                </DropzoneProvider>
              )}
              {busy && (
                <div
                  className="pointer-events-none absolute inset-0 animate-pulse bg-lt-muted/20"
                  data-test="media-dropzone-uploading"
                  role="status"
                >
                  <span className="sr-only">{t("media.dropzone.uploading", "Uploading…")}</span>
                </div>
              )}
            </div>
            <UploadList dismiss={dismiss} retry={retry} uploads={uploads} />
          </div>
        );
      }}
    </SimpleField>
  );
};

export default MediaDropzoneComponent;
